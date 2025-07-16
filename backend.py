import cv2  
import numpy as np
import matplotlib.pyplot as plt
from flask import Flask, render_template, request, redirect, url_for, send_from_directory, jsonify, send_file
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:5174"])

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

# Step 3: Image Stitching 
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

    result= img1_warped
    output_dir="output"
    os.makedirs(output_dir, exist_ok=True)  # ✅ Create output folder if missing
    output_path = os.path.join(output_dir, "result.jpg")
    cv2.imwrite(output_path, result) # Save the stitched image
    return output_path

@app.route('/stitch',methods=['GET', 'POST'])
def stitch():
    print("🔥 Received a", request.method, "request at /stitch")

    if request.method == 'GET':
        return jsonify({"error": "GET not allowed, use POST"}), 405
    img1_file=request.files['image1']
    img2_file=request.files['image2']

    img1_path='temp1.jpg'
    img2_path='temp2.jpg'

    img1_file.save(img1_path)
    img2_file.save(img2_path)

    img1 = cv2.imread(img1_path)
    img2 = cv2.imread(img2_path)
    if img1 is None or img2 is None:
        return jsonify({"error": "Could not read one of the images"}), 400
    kp1, kp2, matches = feature_matching(img1, img2)
    result_path = stitch_images(img1, img2, kp1, kp2, matches)

    return send_file(result_path, mimetype='image/jpeg')

if __name__ == '__main__':
    app.run(debug=True)
