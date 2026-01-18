from ultralytics import YOLO
from PIL import Image
from pathlib import Path

MODEL_PATH = Path(__file__).parent / "models" / "yolov8n.pt"

model = YOLO(str(MODEL_PATH))


def detect_layout(image: Image.Image):
    """
    Возвращает список блоков:
    [
      {
        "bbox": (x1, y1, x2, y2),
        "label": "text",
        "confidence": 0.92
      }
    ]
    """
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

    return blocks
