from ultralytics import YOLO
from PIL import Image
from pathlib import Path
import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    stream=sys.stdout,
    format="%(asctime)s [OCR] %(levelname)s: %(message)s",
)
logger = logging.getLogger(__name__)

MODEL_PATH = Path(__file__).parent / "models" / "yolov8n.pt"

model = YOLO(str(MODEL_PATH))


def detect_layout(image: Image.Image):
    logger.info("YOLO START detect_layout")
    results = model(image)
    blocks = []
    for r in results:
        for box in r.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            cls_id = int(box.cls[0])
            label = model.names[cls_id]
            logger.info(f"Detected class: {label}")
            blocks.append({
                "bbox": (x1, y1, x2, y2),
                "label": label,
                "confidence": float(box.conf[0])
            })

    return blocks
