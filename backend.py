import cv2  
import numpy as np
import os
import logging
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import datetime

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
MAX_FILE_SIZE_MB  = 10                       # Max size per uploaded image
MAX_FILE_SIZE     = MAX_FILE_SIZE_MB * 1024 * 1024   # in bytes
MAX_IMAGE_DIM     = 4000                     # Max width or height in pixels
RATE_LIMIT        = "5 per minute"           # Stitching rate limit per IP

# ---------------------------------------------------------------------------
# App Setup
# ---------------------------------------------------------------------------
app = Flask(__name__)
CORS(app, 
     origins=["http://localhost:5173", "http://localhost:5174", "https://smart-pano.vercel.app"],
     methods=["GET", "POST", "OPTIONS"],
     allow_headers=["Content-Type"],
     supports_credentials=True
)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Redis Rate Limiter
# ---------------------------------------------------------------------------
# flask-limiter uses Redis as its backend to track request counts.
# On Render, set the REDIS_URL env var to your Redis instance URL.
# Locally, it falls back to in-memory storage if Redis is unavailable.
REDIS_URL = os.environ.get("REDIS_URL", None)

limiter = Limiter(
    app=app,
    key_func=get_remote_address,                # Rate-limit by client IP
    storage_uri=REDIS_URL if REDIS_URL else "memory://",  # Redis in prod, memory locally
    default_limits=["200 per day", "50 per hour"],  # Global defaults for all routes
    strategy="fixed-window",                    # Simple fixed time windows
)

# Custom error handler for 429 Too Many Requests
@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({
        "error": "Rate limit exceeded",
        "message": f"You've made too many requests. Please wait and try again.",
        "retry_after": e.description,
    }), 429

# ---------------------------------------------------------------------------
# Helper: Validate uploaded image
# ---------------------------------------------------------------------------
def validate_image(file_storage, label="image"):
    """Validate file size and image dimensions. Returns (cv2_image, None) or (None, error_response)."""
    
    # 1) Check file size
    file_storage.seek(0, 2)          # Seek to end
    size = file_storage.tell()       # Get position = file size
    file_storage.seek(0)             # Reset to beginning
    
    if size > MAX_FILE_SIZE:
        return None, jsonify({
            "error": f"{label} is too large ({size / 1024 / 1024:.1f} MB). "
                     f"Maximum allowed is {MAX_FILE_SIZE_MB} MB."
        }), 400
    
    if size == 0:
        return None, jsonify({"error": f"{label} is empty."}), 400

    # 2) Decode image
    raw_bytes = np.frombuffer(file_storage.read(), np.uint8)
    img = cv2.imdecode(raw_bytes, cv2.IMREAD_COLOR)
    
    if img is None:
        return None, jsonify({"error": f"Could not decode {label}. Is it a valid image?"}), 400
    
    # 3) Check dimensions
    h, w = img.shape[:2]
    if h > MAX_IMAGE_DIM or w > MAX_IMAGE_DIM:
        return None, jsonify({
            "error": f"{label} dimensions ({w}x{h}) exceed the maximum "
                     f"allowed ({MAX_IMAGE_DIM}x{MAX_IMAGE_DIM})."
        }), 400
    
    return img, None

# ---------------------------------------------------------------------------
# Core CV Logic (unchanged)
# ---------------------------------------------------------------------------

# Step 2: Feature Matching using ORB
def feature_matching(img1, img2):
    orb = cv2.ORB_create()  # Initiating ORB detector
    #ORB: We use ORB (Oriented FAST and Rotated BRIEF) to detect features and compute descriptors.

    kp1, des1 = orb.detectAndCompute(img1, None)
    kp2, des2 = orb.detectAndCompute(img2, None)

    # Creating a BFMatcher object with default params
    #bf: Brute Force
    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)

    # Match descriptors
    matches = bf.match(des1, des2)

    # Sort matches based on their distance (best matches first)
    matches = sorted(matches, key=lambda x: x.distance)

    return kp1, kp2, matches


# Step 3: Image Stitching (in-memory, no file storage)
def stitch_images(img1, img2, kp1, kp2, matches):
    # Extract the coordinates of the matched keypoints
    src_pts = np.float32([kp1[m.queryIdx].pt for m in matches]).reshape(-1, 1, 2)
    dst_pts = np.float32([kp2[m.trainIdx].pt for m in matches]).reshape(-1, 1, 2)

    # Compute homography matrix
    H, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)

    # Get the dimensions of the first image
    h1, w1 = img1.shape[:2]
    h2, w2 = img2.shape[:2]

    # Warp the first image with the homography matrix
    img1_warped = cv2.warpPerspective(img1, H, (w1 + w2, max(h1, h2)))

    # Place the second image in the stitched image
    img1_warped[0:h2, 0:w2] = img2

    # Return the stitched image directly (no file storage)
    return img1_warped

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

# Health check / Root route
@app.route('/')
@limiter.exempt                              # No rate limit on health check
def home():
    return jsonify({
        "status": "ok",
        "message": "SmartPanorama API is running",
        "endpoints": {
            "POST /stitch": "Send 'image1' and 'image2' to stitch images"
        }
    })

@app.route('/api/health', methods=['GET'])
@limiter.exempt                              # No rate limit on health check
def health_check():
    return jsonify({
        'status': 'OK',
        'message': 'Your API is running',
        'timestamp': datetime.datetime.utcnow().isoformat()
    })

@app.route('/stitch', methods=['GET', 'POST'])
@limiter.limit(RATE_LIMIT)                   # 5 per minute per IP
def stitch():
    logger.info("🔥 Received a %s request at /stitch", request.method)

    if request.method == 'GET':
        return jsonify({"error": "GET not allowed, use POST"}), 405
    
    # --- Validate both images ---
    if 'image1' not in request.files or 'image2' not in request.files:
        return jsonify({"error": "Both 'image1' and 'image2' files are required."}), 400

    img1, err1 = validate_image(request.files['image1'], "image1")
    if err1:
        return err1
    
    img2, err2 = validate_image(request.files['image2'], "image2")
    if err2:
        return err2
    
    # --- Histogram equalization ---
    img1 = cv2.cvtColor(img1, cv2.COLOR_BGR2YCrCb)
    img2 = cv2.cvtColor(img2, cv2.COLOR_BGR2YCrCb)

    img1[..., 0] = cv2.equalizeHist(img1[..., 0])
    img2[..., 0] = cv2.equalizeHist(img2[..., 0])

    img1 = cv2.cvtColor(img1, cv2.COLOR_YCrCb2BGR)
    img2 = cv2.cvtColor(img2, cv2.COLOR_YCrCb2BGR)
    
    # --- Stitch ---
    kp1, kp2, matches = feature_matching(img1, img2)
    result_image = stitch_images(img1, img2, kp1, kp2, matches)

    # Encode result image to JPEG bytes in memory
    success, encoded_image = cv2.imencode('.jpg', result_image)
    if not success:
        return jsonify({"error": "Failed to encode result image"}), 500
    
    return Response(encoded_image.tobytes(), mimetype='image/jpeg')

if __name__ == '__main__':
    app.run(debug=True)
