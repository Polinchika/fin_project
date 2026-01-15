import { useState } from "react";
import "./styles/global.css";
import "./styles/layout.css";

import AuthForm from "./components/AuthForm";
import UploadForm from "./components/UploadForm";

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

      if (!res.ok) throw new Error("Login failed");

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
   <div className="page">
      <div className="card">
        <h1 className="title">OCR System</h1>

        {!token ? (
          <AuthForm
            username={username}
            password={password}
            setUsername={setUsername}
            setPassword={setPassword}
            onRegister={register}
            onLogin={login}
            message={message}
          />
        ) : (
          <UploadForm
            onLogout={logout}
            setFile={setFile}
            onUpload={upload}
            result={result}
          />
        )}
      </div>
    </div>
  );
}

export default App;
