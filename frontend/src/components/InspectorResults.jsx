import { useEffect, useState } from "react";

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
      <h2>Загруженные документы</h2>
      {results.map((r, i) => (
        <div key={i}>
          <strong>{r.filename}</strong>
          <pre>{r.text}</pre>
        </div>
      ))}
    </div>
  );
}

export default InspectorResults;
