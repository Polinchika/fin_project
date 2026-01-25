import numpy as np
from PIL import Image
import easyocr

print("Loading EasyOCR model...")
reader = easyocr.Reader(
    lang_list=['ru'],
    gpu=False
)
print("EasyOCR loaded")


def recognize_text(image: Image.Image) -> str:
    print("START recognize_text EasyOCR")
    image = image.convert("RGB")
    image_np = np.array(image)

    result = reader.readtext(image_np)
    text = " ".join([text for (_, text, _) in result])
    return text
