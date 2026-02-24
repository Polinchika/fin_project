import numpy as np
from PIL import Image
import easyocr
import torch
import sys

print("Версия Python:", sys.version)
print("Версия PyTorch:", torch.__version__)
print("CUDA доступна:", torch.cuda.is_available())
if torch.cuda.is_available():
    print("Имя GPU:", torch.cuda.get_device_name(0))
    print("Версия CUDA в PyTorch:", torch.version.cuda)

print("Loading EasyOCR model...")
reader = easyocr.Reader(
    lang_list=['ru'],
    gpu=True
)
print("EasyOCR loaded")


def recognize_text(image: Image.Image) -> str:
    print("START recognize_text EasyOCR")
    image = image.convert("RGB")
    image_np = np.array(image)

    result = reader.readtext(image_np)
    text = " ".join([text for (_, text, _) in result])
    return text
