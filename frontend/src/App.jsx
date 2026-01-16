import { useState } from "react";

import Header from "./components/Header";
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
      if (!res.ok) throw new Error("Не удалось зарегистрировать пользователя.");
      setMessage("Успешная регистрация! Вы можете войти.");
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
      if (!res.ok) throw new Error("Неудачная попытка входа. Проверьте логин или пароль.");
      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      setToken(data.access_token);
      setMessage("");
    } catch (err) {
      setMessage(err.message);
    }
  };


  const logout = () => {
    localStorage.removeItem("token");
      setToken(null);
      setUsername("");
      setPassword("");
      setMessage("");
      setFile(null);
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
      if (!res.ok) throw new Error(`Не удалось загрузить файл. ${res.status}`);
      const data = await res.json();
      setResult(data.text);
    } catch (error) {
      setResult(`Ошибка: ${error.message}`);
    }
  };

return (
   <>
      <Header token={token} onLogout={logout} />
      <main>
        {!token ? (
          <AuthForm
            username={username}
            password={password}
            setUsername={setUsername}
            setPassword={setPassword}
            onLogin={login}
            onRegister={register}
            message={message}
          />
        ) : (
          <UploadForm onUpload={upload} setFile={setFile} result={result} />
        )}
      </main>
    </>
  );
}

export default App;
