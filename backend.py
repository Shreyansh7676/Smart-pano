import os
import logging
from dotenv import load_dotenv
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from redis import Redis
from redis.exceptions import ConnectionError as RedisConnectionError
from rq import Queue
from rq.job import Job
import datetime

from stitch_jobs import decode_image_from_bytes, stitch_from_bytes, stitch_from_images
# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
MAX_FILE_SIZE_MB  = 10                       # Max size per uploaded image
MAX_FILE_SIZE     = MAX_FILE_SIZE_MB * 1024 * 1024   # in bytes
MAX_IMAGE_DIM     = 4000                     # Max width or height in pixels
RATE_LIMIT        = "2 per minute"           # Stitching rate limit per IP
RQ_QUEUE_NAME     = "stitch"                # RQ queue name for async stitching
RQ_RESULT_TTL_SEC = 3600                     # Keep completed job results for 1 hour
RQ_FAILURE_TTL_SEC = 3600                    # Keep failed job info for 1 hour
RQ_JOB_TIMEOUT_SEC = 120                     # Max seconds per stitch job

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
load_dotenv()
REDIS_URL = os.environ.get("REDIS_URL", None)

def get_redis_connection():
    if REDIS_URL:
        return Redis.from_url(REDIS_URL)
    return Redis()

redis_conn = get_redis_connection()
rq_queue = Queue(RQ_QUEUE_NAME, connection=redis_conn)

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
def read_and_validate_image(file_storage, label="image"):
    """Validate file size and image dimensions. Returns (cv2_image, raw_bytes, None) or (None, None, error_response)."""

    # 1) Check file size
    file_storage.seek(0, 2)          # Seek to end
    size = file_storage.tell()       # Get position = file size
    file_storage.seek(0)             # Reset to beginning

    if size > MAX_FILE_SIZE:
        return None, None, jsonify({
            "error": f"{label} is too large ({size / 1024 / 1024:.1f} MB). "
                     f"Maximum allowed is {MAX_FILE_SIZE_MB} MB."
        }), 400

    if size == 0:
        return None, None, jsonify({"error": f"{label} is empty."}), 400

    # 2) Decode image
    raw_bytes = file_storage.read()
    try:
        img = decode_image_from_bytes(raw_bytes, label, MAX_IMAGE_DIM)
    except ValueError as exc:
        return None, None, jsonify({"error": str(exc)}), 400

    return img, raw_bytes, None

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
            "POST /stitch": "Send 'image1' and 'image2' to stitch images",
            "POST /stitch/async": "Enqueue stitching job, returns job_id",
            "GET /stitch/status/<job_id>": "Check async job status",
            "GET /stitch/result/<job_id>": "Fetch stitched image when ready"
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
@limiter.limit(RATE_LIMIT)                   # 2 per minute per IP
def stitch():
    logger.info("🔥 Received a %s request at /stitch", request.method)

    if request.method == 'GET':
        return jsonify({"error": "GET not allowed, use POST"}), 405
    
    # --- Validate both images ---
    if 'image1' not in request.files or 'image2' not in request.files:
        return jsonify({"error": "Both 'image1' and 'image2' files are required."}), 400

    img1, img1_bytes, err1 = read_and_validate_image(request.files['image1'], "image1")
    if err1:
        return err1

    img2, img2_bytes, err2 = read_and_validate_image(request.files['image2'], "image2")
    if err2:
        return err2

    try:
        result_bytes = stitch_from_images(img1, img2)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 500

    return Response(result_bytes, mimetype='image/jpeg')


@app.route('/stitch/async', methods=['POST'])
@limiter.limit(RATE_LIMIT)                   # 2 per minute per IP
def stitch_async():
    logger.info("🔥 Received a %s request at /stitch/async", request.method)

    if 'image1' not in request.files or 'image2' not in request.files:
        return jsonify({"error": "Both 'image1' and 'image2' files are required."}), 400

    _, img1_bytes, err1 = read_and_validate_image(request.files['image1'], "image1")
    if err1:
        return err1

    _, img2_bytes, err2 = read_and_validate_image(request.files['image2'], "image2")
    if err2:
        return err2

    try:
        job = rq_queue.enqueue(
            stitch_from_bytes,
            img1_bytes,
            img2_bytes,
            MAX_IMAGE_DIM,
            result_ttl=RQ_RESULT_TTL_SEC,
            failure_ttl=RQ_FAILURE_TTL_SEC,
            job_timeout=RQ_JOB_TIMEOUT_SEC,
        )
        logger.info("Enqueued stitch job %s on queue %s", job.id, RQ_QUEUE_NAME)
    except RedisConnectionError:
        return jsonify({"error": "Redis is not available for background jobs"}), 503

    return jsonify({"job_id": job.id, "status": job.get_status()}), 202


@app.route('/stitch/status/<job_id>', methods=['GET'])
def stitch_status(job_id):
    try:
        job = Job.fetch(job_id, connection=redis_conn)
    except Exception:
        return jsonify({"error": "Job not found"}), 404

    return jsonify({"job_id": job.id, "status": job.get_status()}), 200


@app.route('/stitch/result/<job_id>', methods=['GET'])
def stitch_result(job_id):
    try:
        job = Job.fetch(job_id, connection=redis_conn)
    except Exception:
        return jsonify({"error": "Job not found"}), 404

    if job.is_failed:
        return jsonify({"error": "Job failed", "details": str(job.exc_info)}), 500

    if not job.is_finished:
        return jsonify({"status": job.get_status()}), 202

    result_bytes = job.result
    if not result_bytes:
        return jsonify({"error": "Job finished without a result"}), 500

    return Response(result_bytes, mimetype='image/jpeg')

if __name__ == '__main__':
    app.run(debug=True)
