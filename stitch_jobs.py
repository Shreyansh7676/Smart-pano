import cv2
import numpy as np


def decode_image_from_bytes(raw_bytes, label, max_dim):
    img = cv2.imdecode(np.frombuffer(raw_bytes, np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError(f"Could not decode {label}. Is it a valid image?")

    h, w = img.shape[:2]
    if h > max_dim or w > max_dim:
        raise ValueError(
            f"{label} dimensions ({w}x{h}) exceed the maximum allowed ({max_dim}x{max_dim})."
        )

    return img


def _equalize_histogram(img):
    ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
    ycrcb[..., 0] = cv2.equalizeHist(ycrcb[..., 0])
    return cv2.cvtColor(ycrcb, cv2.COLOR_YCrCb2BGR)


def feature_matching(img1, img2):
    orb = cv2.ORB_create()

    kp1, des1 = orb.detectAndCompute(img1, None)
    kp2, des2 = orb.detectAndCompute(img2, None)

    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
    matches = bf.match(des1, des2)
    matches = sorted(matches, key=lambda x: x.distance)

    return kp1, kp2, matches


def stitch_images(img1, img2, kp1, kp2, matches):
    src_pts = np.float32([kp1[m.queryIdx].pt for m in matches]).reshape(-1, 1, 2)
    dst_pts = np.float32([kp2[m.trainIdx].pt for m in matches]).reshape(-1, 1, 2)

    H, _ = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)

    h1, w1 = img1.shape[:2]
    h2, w2 = img2.shape[:2]

    img1_warped = cv2.warpPerspective(img1, H, (w1 + w2, max(h1, h2)))
    img1_warped[0:h2, 0:w2] = img2

    return img1_warped


def stitch_from_images(img1, img2):
    img1 = _equalize_histogram(img1)
    img2 = _equalize_histogram(img2)

    kp1, kp2, matches = feature_matching(img1, img2)
    result_image = stitch_images(img1, img2, kp1, kp2, matches)

    success, encoded_image = cv2.imencode(".jpg", result_image)
    if not success:
        raise ValueError("Failed to encode result image")

    return encoded_image.tobytes()


def stitch_from_bytes(img1_bytes, img2_bytes, max_dim):
    img1 = decode_image_from_bytes(img1_bytes, "image1", max_dim)
    img2 = decode_image_from_bytes(img2_bytes, "image2", max_dim)
    return stitch_from_images(img1, img2)
