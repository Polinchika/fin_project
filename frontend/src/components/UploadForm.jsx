import { useEffect, useState } from "react";
import "../styles/upload.css";

const LABEL_MAP = {
  num_license: "Номер лицензии",
  code: "Код услуги",
  INN_organization: "ИНН организации",
  INN_taxpayer: "ИНН налогоплательщика",
  amount: "Сумма оплаты",
  date: "Дата оплаты",
};

function UploadForm({ onUpload, setFile, result, onSave }) {
  const [editableBlocks, setEditableBlocks] = useState([]);

  useEffect(() => {
    if (result?.blocks) {
      setEditableBlocks(result.blocks);
    }
  }, [result]);

  const updateBlockText = (index, newText) => {
    setEditableBlocks(prev =>
      prev.map((b, i) =>
        i === index ? { ...b, text: newText } : b
      )
    );
  };

  const save = () => {
    onSave(editableBlocks);
  };

  return (
    <div className="upload">
      <h2>Загрузка изображения</h2>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={onUpload}>Распознать текст</button>

      {editableBlocks.length > 0 && (
        <section className="blocks-section">
          <h3 className="blocks-title">Распознанные данные</h3>

          <div className="blocks-editor">
            {editableBlocks.map((block, index) => (
              <div key={index} className="block-row">
                <div className="block-meta">
                  <span className="block-label">{LABEL_MAP[block.label] ?? block.label}</span>
                </div>

                <input
                  className="block-input"
                  type="text"
                  value={block.text}
                  onChange={(e) =>
                    updateBlockText(index, e.target.value)
                  }
                />
              </div>
            ))}
          </div>

          <div className="blocks-actions">
            <button className="save-btn" onClick={save}>
              Сохранить изменения
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export default UploadForm;
