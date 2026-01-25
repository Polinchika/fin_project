from PIL import Image
from ultralytics import YOLO
from pathlib import Path
import numpy as np
import cv2

MODEL_PATH = Path(__file__).parent / "models" / "best.pt"

model = YOLO(str(MODEL_PATH))
print(model.names)  # Названия классов
print(model.args)   # Аргументы обучения

def detect_layout(image: Image.Image):
    print("---------START detect_layout...---------")
    results = model(image)
    blocks = []
    for r in results:
        for box in r.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            cls_id = int(box.cls[0])
            label = model.names[cls_id]

            blocks.append({
                "bbox": (x1, y1, x2, y2),
                "label": label,
                "confidence": float(box.conf[0])
            })

    print(f"---------blocks count: {len(blocks)}---------")
    return blocks
