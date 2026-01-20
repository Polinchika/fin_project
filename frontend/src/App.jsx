import { useState } from "react";

import Header from "./components/Header";
import AuthForm from "./components/AuthForm";
import UploadForm from "./components/UploadForm";
import InspectorResults from "./components/InspectorResults";
import MyResults from "./components/MyResults";


function parseJwt(token) {
  if (!token) return null;
  const base64 = token.split(".")[1];
  return JSON.parse(atob(base64));
}

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [resultId, setResultId] = useState(null);
  const [refreshResults, setRefreshResults] = useState(0);
  const [message, setMessage] = useState("");

  const API_URL = "/api";

  const payload = parseJwt(token);
  const role = payload?.role;

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
      setResultId(data.result_id);
      setResult({ blocks: data.text.blocks });
      setRefreshResults(prev => prev + 1);

    } catch (error) {
      setResult(`Ошибка: ${error.message}`);
    }
  };

  const saveBlocks = async (blocks) => {
    await fetch(`${API_URL}/results/${resultId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ blocks }),
    });

    alert("Изменения сохранены");
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
          <>
            {role === "user" && (
              <>
                <UploadForm onUpload={upload} setFile={setFile} result={result} onSave={saveBlocks} />
                <MyResults token={token} refreshKey={refreshResults} />
              </>
            )}
            {role === "inspector" && (
            <InspectorResults />
            )}
          </>
        )}
      </main>
    </>
  );
}

export default App;
