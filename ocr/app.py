from flask import Flask, request, jsonify
from PIL import Image
import io

from pipeline import analyze_document

app = Flask(__name__)

@app.route("/ocr", methods=["POST"])
def ocr():
    file = request.files.get("file")
    if not file:
        return jsonify({"Ошибка": "Файл не найден."}), 400

    image = Image.open(io.BytesIO(file.read()))

    result = analyze_document(image)

    return jsonify({
        "blocks": result
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7070, debug=True, use_reloader=True)