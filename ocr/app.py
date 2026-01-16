from flask import Flask, request, jsonify
from PIL import Image
import io

from trocr_model import recognize_text

app = Flask(__name__)

@app.route("/ocr", methods=["POST"])
def ocr():
    if "file" not in request.files:
        return jsonify({"Ошибка": "Файл не найден."}), 400

    file = request.files["file"]
    image_bytes = file.read()

    try:
        image = Image.open(io.BytesIO(image_bytes))
    except Exception:
        return jsonify({"Ошибка": "Некорректное изображение"}), 400

    text = recognize_text(image)

    return jsonify({"text": text})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7070)