from PIL import Image
from layout_detector import detect_layout
from trocr_model import recognize_text
import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    stream=sys.stdout,
    format="%(asctime)s [OCR] %(levelname)s: %(message)s",
)
logger = logging.getLogger(__name__)

def analyze_document(image: Image.Image):
    print("START analyze_document")

    blocks = detect_layout(image) or []
    print(f"----------blocks count----------: {len(blocks)}")

    result_blocks = []
    full_text_parts = []

    if len(blocks) == 0:
        logger.warning("---------Не найден ни один текстовый блок---------")
        text = recognize_text(image)
        full_text_parts.append(text)
        w, h = image.size
        result_blocks.append({
            "bbox": (0, 0, w, h),
            "label": "full_page",
            "confidence": 1.0,
            "text": text,
        })
    else:
        for block in blocks:
            x1, y1, x2, y2 = block["bbox"]
            cropped = image.crop((x1, y1, x2, y2))
            text = recognize_text(cropped)
            full_text_parts.append(text)

            result_blocks.append({
                "bbox": block["bbox"],
                "label": block.get("label", "text"),
                "confidence": block.get("confidence"),
                "text": text
            })

    return {
        "blocks": result_blocks,
        "full_text": "\n\n".join(full_text_parts)
    }
