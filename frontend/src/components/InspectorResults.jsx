import { useEffect, useState, Fragment } from "react";
import { downloadFile } from "../utils/downloadFile";
import { downloadDocument } from "../utils/downloadDocument";
import { downloadDocx } from "../utils/downloadDocx";
import "../styles/results.css";

const LABEL_MAP = {
  num_license: "Номер лицензии",
  code: "Код услуги",
  INN_organization: "ИНН организации",
  INN_taxpayer: "ИНН налогоплательщика",
  amount: "Сумма оплаты",
  date: "Дата оплаты",
};

function InspectorResults() {
  const [results, setResults] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [editBlocks, setEditBlocks] = useState(null);
  const token = localStorage.getItem("token");
  const [imageUrls, setImageUrls] = useState({});

  const loadImage = async (fileId) => {
    if (imageUrls[fileId]) return;

    const res = await fetch(`/api/files/${fileId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error("Не удалось загрузить изображение");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    setImageUrls(prev => ({
      ...prev,
      [fileId]: url,
    }));
  };

  const loadResults = () => {
    if (!token) return;

    fetch("/api/results/all", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(setResults);
  };

  useEffect(() => {
    loadResults();
  }, []);

  const toggleExpand = (item) => {
    if (expandedId === item.file_id) {
      setExpandedId(null);
      setEditBlocks(null);
    } else {
      setExpandedId(item.file_id);
      setEditBlocks(item.blocks?.blocks ? [...item.blocks.blocks] : []);
      loadImage(item.file_id); // ВАЖНО
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
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ blocks: editBlocks }),
    });

    alert("Изменения сохранены");
    loadResults();
  };

  return (
    <div className="results">
      <div className="results-toolbar">
        <span className="results-title">Документы пользователей</span>

        <button
          className="toolbar-btn"
          title="Обновить список"
          onClick={loadResults}
        >
          ↻
        </button>
      </div>

      {results.length === 0 && <p>Нет загруженных документов</p>}

      {results.length > 0 && (
        <div className="results-grid inspector">
          {/* Заголовки */}
          <div className="grid-cell header">Файл</div>
          <div className="grid-cell header">Пользователь</div>
          <div className="grid-cell header">Дата</div>
          <div className="grid-cell header">Действия</div>

          {/* Данные */}
          {results.map(item => (
            <Fragment key={item.file_id}>
              <div className="grid-cell">{item.filename}</div>
              <div className="grid-cell">{item.username}</div>
              <div className="grid-cell">
                {new Date(item.created_at).toLocaleString()}
              </div>
              <div className="grid-cell actions">
                <button onClick={() => downloadFile(item.file_id, item.filename)}>
                  Исходный файл
                </button>
                <button onClick={() => downloadDocx(item.file_id)}>
                  Скачать DOCX
                </button>
                <button onClick={() => toggleExpand(item)}>
                  {expandedId === item.file_id ? "Скрыть данные" : "Показать данные"}
                </button>
              </div>

              {expandedId === item.file_id && (
                <div className="grid-expanded">
                  <div className="ocr-review">
                    {/* Левая панель — изображение */}
                    <div className="ocr-image-panel">
                      {imageUrls[item.file_id] ? (
                        <img
                          src={imageUrls[item.file_id]}
                          alt="Исходное изображение"
                          className="ocr-image"
                        />
                      ) : (
                        <p>Загрузка изображения…</p>
                      )}
                    </div>

                    {/* Правая панель — распознанные данные */}
                    <div className="ocr-data-panel">
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
                        Сохранить изменения
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

export default InspectorResults;
