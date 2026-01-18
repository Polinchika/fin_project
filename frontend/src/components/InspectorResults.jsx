import { useEffect, useState } from "react";
import { downloadFile } from "../utils/downloadFile";
import { downloadDocument } from "../utils/downloadDocument";
import { downloadDocx } from "../utils/downloadDocx";

function InspectorResults() {
  const [results, setResults] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    fetch("/api/results/all", {
      headers: {
        Authorization: `Bearer ${token}`,
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
            {/* === YOLO нашёл блоки === */}
            {item.blocks?.blocks && item.blocks.blocks.length > 0 ? (
              item.blocks.blocks.map((block, idx) => (
                <div key={idx} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    {block.label} · conf: {block.confidence?.toFixed(2)}
                  </div>
                  <pre style={{ whiteSpace: "pre-wrap" }}>
                    {block.text}
                  </pre>
                </div>
              ))
            ) : item.blocks?.full_text ? (
              /* === YOLO ничего не нашёл, fallback === */
              <pre style={{ whiteSpace: "pre-wrap" }}>
                {item.blocks.full_text}
              </pre>
            ) : (
              <p>Нет данных OCR</p>
            )}
          </details>

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
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
        </div>
      ))}
    </div>
  );
}

export default InspectorResults;
