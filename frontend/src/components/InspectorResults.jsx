import { useEffect, useState } from "react";
import { downloadFile } from "../utils/downloadFile";
import { downloadDocument } from "../utils/downloadDocument";
import { downloadDocx } from "../utils/downloadDocx";

function InspectorResults() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetch("/api/results/all", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(res => res.json())
      .then(setResults);
  }, []);

  return (
    <div>
      <h2>Документы пользователей</h2>

      {results.length === 0 && <p>Нет загруженных документов</p>}

      {results.map((item) => (
        <div
          key={item.file_id}
          style={{
            borderBottom: "1px solid #ccc",
            marginBottom: 16,
            paddingBottom: 16
          }}
        >
          <p><strong>Файл:</strong> {item.filename}</p>
          <p><strong>Пользователь:</strong> {item.username}</p>
          <p><strong>Дата:</strong> {item.created_at}</p>

          <details>
            <summary>Распознанный текст</summary>
            <pre>{item.ocr_text}</pre>
          </details>

          <button onClick={() => downloadFile(item.file_id, item.filename)}>
            Скачать исходный файл
          </button>
          <button onClick={() => downloadDocument(item.file_id)}>
            Скачать PDF с текстом
          </button>
          <button onClick={() => downloadDocx(item.file_id)}>
            Скачать DOCX
          </button>
        </div>
      ))}
    </div>
  );
}

export default InspectorResults;
