from PIL import Image
from layout_detector import detect_layout
from trocr_model import recognize_text
import logging
import sys #, os

logging.basicConfig(
    level=logging.INFO,
    stream=sys.stdout,
    format="%(asctime)s [OCR] %(levelname)s: %(message)s",
)
logger = logging.getLogger(__name__)

# def save_cropped_blocks(image: Image.Image, blocks, output_dir="output_blocks"):
#     """Сохраняет фрагменты изображения в файлы"""
    
#     # Создаем директорию, если ее нет
#     os.makedirs(output_dir, exist_ok=True)
    
#     saved_files = []
    
#     for i, block in enumerate(blocks):
#         bbox = block["bbox"]
#         label = block["label"]
#         conf = block["confidence"]
        
#         # Обрезаем изображение
#         cropped_img = image.crop(bbox)
        
#         # Генерируем имя файла
#         filename = f"block_{i:03d}_{label}_{conf:.2f}.png"
#         filepath = os.path.join(output_dir, filename)
        
#         # Сохраняем
#         cropped_img.save(filepath)
#         saved_files.append({
#             "filepath": filepath,
#             "bbox": bbox,
#             "label": label,
#             "confidence": conf
#         })
        
#         print(f"Сохранено: {filepath}")
    
#     return saved_files

def analyze_document(image: Image.Image):
    print("START analyze_document")

    blocks = detect_layout(image) or []
    print(f"----------blocks count----------: {len(blocks)}")
    # saved_files = save_cropped_blocks(image, blocks)
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
