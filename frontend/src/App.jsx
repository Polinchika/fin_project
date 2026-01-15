import { useState } from "react";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [message, setMessage] = useState("");

  const API_URL = "/api";


  const register = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          role: "user",
        }),
      });

      if (!res.ok) {
        throw new Error("Registration failed");
      }

      setMessage("Registration successful. You can login.");
    } catch (err) {
      setMessage(err.message);
    }
  };


  const login = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        throw new Error("Login failed");
      }

      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      setToken(data.access_token);
      setMessage("Logged in");
    } catch (err) {
      setMessage(err.message);
    }
  };


  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setResult("");
  };


  const upload = async () => {
    if (!file) {
      alert("Выберите файл для загрузки.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status}`);
      }

      const data = await res.json();
      setResult(data.text);
    } catch (error) {
      setResult(`Error: ${error.message}`);
    }
  };

return (
    <div style={{ padding: 20 }}>
      <h1>OCR System</h1>

      {!token ? (
        <>
          <h2>Auth</h2>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <br />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
          <button onClick={register}>Register</button>
          <button onClick={login}>Login</button>
          <p>{message}</p>
        </>
      ) : (
        <>
          <button onClick={logout}>Logout</button>

          <h2>Upload image</h2>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <br />
          <button onClick={upload}>Upload</button>

          <p>Result:</p>
          <pre>{result}</pre>
        </>
      )}
    </div>
  );
}

export default App;
