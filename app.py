import cv2  
import numpy as np
# import matplotlib.pyplot as plt
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
# from io import BytesIO

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:5174", "https://smart-pano.vercel.app/"])

# Step 2: Feature Matching using ORB
def feature_matching(img1, img2):
    orb = cv2.ORB_create()  # Initiating ORB detector
    #ORB: We use ORB (Oriented FAST and Rotated BRIEF) to detect features and compute descriptors.

    kp1, des1 = orb.detectAndCompute(img1, None) # Find the keypoints and descriptors with ORB
    kp2, des2 = orb.detectAndCompute(img2, None)

    # Creating a BFMatcher object with default params
    #bf: Brute Force
    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)

    # Match descriptors
    matches = bf.match(des1, des2)

    # Sort matches based on their distance (best matches first)
    matches = sorted(matches, key=lambda x: x.distance)

    return kp1, kp2, matches

# def crop_black(image):
#     gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
#     _, thresh = cv2.threshold(gray, 1, 255, cv2.THRESH_BINARY)
#     contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
#     if not contours:
#         return image
#     x, y, w, h = cv2.boundingRect(contours[0])
#     cropped = image[y:y+h, x:x+w]
#     return cropped


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


@app.route('/stitch',methods=['GET', 'POST'])
def stitch():
    print("🔥 Received a", request.method, "request at /stitch")

    if request.method == 'GET':
        return jsonify({"error": "GET not allowed, use POST"}), 405
    
    img1_file = request.files['image1']
    img2_file = request.files['image2']

    # Read images directly from memory (no file storage)
    img1_bytes = np.frombuffer(img1_file.read(), np.uint8)
    img2_bytes = np.frombuffer(img2_file.read(), np.uint8)
    
    img1 = cv2.imdecode(img1_bytes, cv2.IMREAD_COLOR)
    img2 = cv2.imdecode(img2_bytes, cv2.IMREAD_COLOR)
    
    if img1 is None or img2 is None:
        return jsonify({"error": "Could not read one of the images"}), 400
    
    img1 = cv2.cvtColor(img1, cv2.COLOR_BGR2YCrCb)
    img2 = cv2.cvtColor(img2, cv2.COLOR_BGR2YCrCb)

    img1[..., 0] = cv2.equalizeHist(img1[..., 0])  # Equalize Y channel
    img2[..., 0] = cv2.equalizeHist(img2[..., 0])

    img1 = cv2.cvtColor(img1, cv2.COLOR_YCrCb2BGR)
    img2 = cv2.cvtColor(img2, cv2.COLOR_YCrCb2BGR)
    
    kp1, kp2, matches = feature_matching(img1, img2)
    result_image = stitch_images(img1, img2, kp1, kp2, matches)

    # Encode result image to JPEG bytes in memory
    success, encoded_image = cv2.imencode('.jpg', result_image)
    if not success:
        return jsonify({"error": "Failed to encode result image"}), 500
    
    # Return image directly from memory
    return Response(encoded_image.tobytes(), mimetype='image/jpeg')

if __name__ == '__main__':
    app.run(debug=True)
