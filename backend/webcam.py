"""
SentinelX - Webcam Capture Module
Captures intruder images using OpenCV when unauthorized access is detected.
"""

import cv2
import datetime
import os
from pathlib import Path

# Directory to save intruder images
INTRUDER_DIR = Path(__file__).parent.parent / "intruder_images"
INTRUDER_DIR.mkdir(exist_ok=True)


def capture_intruder_image() -> str:
    """
    Captures a photo from the webcam and saves it to /intruder_images/.
    Returns the filename of the saved image, or a placeholder if webcam unavailable.
    """
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"intruder_{timestamp}.jpg"
    filepath = INTRUDER_DIR / filename

    try:
        # Open the default webcam (index 0)
        cap = cv2.VideoCapture(0)

        if not cap.isOpened():
            # Webcam not available — save a placeholder image
            return _save_placeholder(filename, filepath)

        # Warm up camera (discard first few frames)
        for _ in range(5):
            cap.read()

        # Capture frame
        ret, frame = cap.read()
        cap.release()

        if ret and frame is not None:
            cv2.imwrite(str(filepath), frame)
            print(f"[SentinelX] Intruder image captured: {filename}")
            return filename
        else:
            return _save_placeholder(filename, filepath)

    except Exception as e:
        print(f"[SentinelX] Webcam error: {e}")
        return _save_placeholder(filename, filepath)


def save_base64_image(image_b64: str) -> str:
    """
    Saves a base64 encoded image string from the frontend as a file.
    Returns the filename of the saved image.
    """
    import base64
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"intruder_{timestamp}.jpg"
    filepath = INTRUDER_DIR / filename

    try:
        # Split header if present (e.g. "data:image/jpeg;base64,...")
        if "," in image_b64:
            image_b64 = image_b64.split(",")[1]
        
        img_data = base64.b64decode(image_b64)
        with open(filepath, "wb") as f:
            f.write(img_data)
        
        print(f"[SentinelX] Uploaded intruder image saved: {filename}")
        return filename
    except Exception as e:
        print(f"[SentinelX] Failed to save uploaded image: {e}")
        return _save_placeholder(filename, filepath)


def _save_placeholder(filename: str, filepath: Path) -> str:
    """
    Creates a placeholder image when webcam is unavailable.
    Uses OpenCV to draw a warning image.
    """
    try:
        import numpy as np

        # Create a dark image with warning text
        img = np.zeros((480, 640, 3), dtype=np.uint8)
        img[:] = (20, 20, 30)  # Dark background

        # Draw warning text
        cv2.putText(img, "INTRUSION DETECTED", (80, 180),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 255), 2)
        cv2.putText(img, "Webcam Unavailable", (140, 250),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (100, 100, 255), 2)
        cv2.putText(img, f"Time: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                    (100, 320), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (150, 150, 150), 1)

        cv2.imwrite(str(filepath), img)
        print(f"[SentinelX] Placeholder image saved: {filename}")
        return filename
    except Exception as e:
        print(f"[SentinelX] Placeholder creation failed: {e}")
        return filename
