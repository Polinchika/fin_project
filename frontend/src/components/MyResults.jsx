import { useEffect, useState, Fragment } from "react";
import { downloadFile } from "../utils/downloadFile";
import "../styles/results.css";

const LABEL_MAP = {
  num_license: "Номер лицензии",
  code: "Код услуги",
  INN_organization: "ИНН организации",
  INN_taxpayer: "ИНН налогоплательщика",
  amount: "Сумма оплаты",
  date: "Дата оплаты",
};

function MyResults({ token, refreshKey }) {
  const [results, setResults] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [editBlocks, setEditBlocks] = useState(null);

  const loadResults = () => {
  if (!token) return;
  fetch("/api/results/self", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setResults(data));
  };

  useEffect(() => {
    loadResults();
  }, [token, refreshKey]);

  const toggleExpand = (item) => {
    if (expandedId === item.file_id) {
      setExpandedId(null);
      setEditBlocks(null);
    } else {
      setExpandedId(item.file_id);
      setEditBlocks(item.blocks?.blocks ? [...item.blocks.blocks] : []);
    }
  };

  const updateBlock = (index, value) => {
    setEditBlocks(prev =>
      prev.map((b, i) => (i === index ? { ...b, text: value } : b))
    );
  };

  const saveBlocks = async (fileId) => {
    await fetch(`/api/results/${fileId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ blocks: editBlocks })
    });

    alert("Изменения сохранены");
  };

  return (
    <div className="results">
      <div className="results-toolbar">
        <h2>Загруженные файлы</h2>
        <span className="results-title"></span>

        <button
          className="toolbar-btn"
          title="Обновить список"
          onClick={loadResults}
        >
          ↻
        </button>
      </div>

      {results.length === 0 && <p>Файлы не найдены</p>}

      {results.length > 0 && (
        <div className="results-grid user">
          <div className="grid-cell header">Файл</div>
          <div className="grid-cell header">Дата</div>
          <div className="grid-cell header">Действия</div>

          {results.map(item => (
            <Fragment key={item.file_id}>
              <div className="grid-cell">{item.filename}</div>
              <div className="grid-cell">
                {new Date(item.created_at).toLocaleString()}
              </div>
              <div className="grid-cell actions">
                <button onClick={() => downloadFile(item.file_id, item.filename)}>
                  Скачать исходный файл
                </button>
                <button onClick={() => toggleExpand(item)}>
                  {expandedId === item.file_id ? "Скрыть данные" : "Показать данные"}
                </button>
              </div>

              {expandedId === item.file_id && (
                <div className="grid-expanded">
                  {editBlocks && editBlocks.length > 0 ? (
                    <>
                      {editBlocks.map((block, idx) => (
                        <div key={idx} className="edit-block">
                          <div className="edit-label">
                            {LABEL_MAP[block.label] ?? block.label}
                          </div>

                          <input
                            type="text"
                            value={block.text}
                            onChange={(e) =>
                              updateBlock(idx, e.target.value)
                            }
                          />
                        </div>
                      ))}

                      <button
                        className="save-btn"
                        onClick={() => saveBlocks(item.file_id)}
                      >
                        Cохранить
                      </button>
                    </>
                  ) : (
                    <p>Нет данных OCR</p>
                  )}
                </div>
              )}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyResults;
