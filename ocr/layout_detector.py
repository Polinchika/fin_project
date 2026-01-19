from PIL import Image
from paddleocr import PaddleOCR
import numpy as np
import cv2

paddle_detector = PaddleOCR(
    lang="ru",           
    use_angle_cls=True,   
    rec=False,            
    use_gpu=False
)

def upscale_for_dbnet(img: np.ndarray, min_side=1280):
    h, w = img.shape[:2]
    scale = min_side / min(h, w)
    if scale > 1.0:
        img = cv2.resize(
            img,
            (int(w * scale), int(h * scale)),
            interpolation=cv2.INTER_CUBIC
        )
    return img

def detect_layout(image: Image.Image):
    print("PaddleOCR START detect_layout...")
    img = np.array(image.convert("RGB"))
    h, w = img.shape[:2]

    # PaddleOCR возвращает список страниц
    result = paddle_detector.ocr(img, cls=True)

    blocks = []

    if not result or not result[0]:
        print("PaddleOCR: no text detected")
        return []

    # result[0] — список строк
    for line in result[0]:
        box, (_, confidence) = line
        # box: [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]

        xs = [int(p[0]) for p in box]
        ys = [int(p[1]) for p in box]

        x1 = max(min(xs), 0)
        y1 = max(min(ys), 0)
        x2 = min(max(xs), w)
        y2 = min(max(ys), h)

        # защита от мусора
        if x2 <= x1 or y2 <= y1:
            continue

        blocks.append({
            "bbox": (x1, y1, x2, y2),
            "label": "text_line",
            "confidence": float(confidence)
        })

    print(f"PaddleOCR blocks count: {len(blocks)}")
    return blocks
