import { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");

  const upload = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8080/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      setResult(data.text);
    } catch (error) {
      setResult(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <h1>OCR Upload</h1>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={upload}>Upload</button>
      <p>Result: {result}</p>
    </div>
  );
}

export default App;
