import torch
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from PIL import Image

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print("Loading TrOCR model...")
processor = TrOCRProcessor.from_pretrained("raxtemur/trocr-base-ru")
model = VisionEncoderDecoderModel.from_pretrained("raxtemur/trocr-base-ru")
model.to(DEVICE)
model.eval()
print("TrOCR loaded")


def recognize_text(image: Image.Image) -> str:
    image = image.convert("RGB")

    pixel_values = processor(
        image,
        return_tensors="pt"
    ).pixel_values.to(DEVICE)

    with torch.no_grad():
        generated_ids = model.generate(pixel_values)

    text = processor.batch_decode(
        generated_ids,
        skip_special_tokens=True
    )[0]

    return text
