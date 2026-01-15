import "../styles/upload.css";

export default function UploadForm({
  onLogout,
  setFile,
  onUpload,
  result,
}) {
  return (
    <div className="upload-form">
      <button className="btn-secondary" onClick={onLogout}>
        Logout
      </button>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <button className="btn-primary" onClick={onUpload}>
        Upload image
      </button>

      {result && (
        <div className="result-box">
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}
