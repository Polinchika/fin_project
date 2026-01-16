import { useEffect, useState } from "react";
import { downloadFile } from "../utils/downloadFile";

function MyResults({ token }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetch("/api/results/self", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setResults(data));
  }, [token]);

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
            <pre>{item.ocr_text}</pre>
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
