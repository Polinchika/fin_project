import "../styles/upload.css";

function UploadForm({ onUpload, setFile, result }) {
  return (
    <div className="upload">
      <h2>Загрузка изображения</h2>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <button onClick={onUpload}>Распознать текст</button>

      {result?.full_text && (
        <>
          <h3>Результат распознавания:</h3>
          <pre className="upload__result">
            {result.full_text}
          </pre>
        </>
      )}
    </div>
  );
}

export default UploadForm;
