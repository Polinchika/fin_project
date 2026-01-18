import { useEffect, useState } from "react";
import { downloadFile } from "../utils/downloadFile";

function MyResults({ token, refreshKey }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!token) return;
    fetch("/api/results/self", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setResults(data));
  }, [token, refreshKey]);

  return (
    <div>
      <h2>Мои загруженные файлы</h2>

      {results.length === 0 && <p>Файлы не найдены</p>}

      {results.map((item) => (
        <div key={item.file_id} style={{ borderBottom: "1px solid #ccc", marginBottom: 16 }}>
          <p><strong>Файл:</strong> {item.filename}</p>
          <p><strong>Дата:</strong> {item.created_at}</p>

          <details>
            <summary>Распознанный текст</summary>
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
              <pre style={{ whiteSpace: "pre-wrap" }}>
                {item.blocks.full_text}
              </pre>
            ) : (
              <p>Нет данных OCR</p>
            )}
          </details>

          <button onClick={() => downloadFile(item.file_id, item.filename)}>
            Скачать файл
          </button>
        </div>
      ))}
    </div>
  );
}

export default MyResults;
