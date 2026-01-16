import "../styles/auth.css";

function AuthForm({
  username,
  password,
  setUsername,
  setPassword,
  onLogin,
  onRegister,
  message,
}) {
  return (
    <div className="auth">
      <h2>Вход / регистрация</h2>

      <input
        placeholder="Имя пользователя"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        placeholder="Пароль"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="auth__buttons">
        <button onClick={onLogin}>Войти</button>
        <button className="secondary" onClick={onRegister}>
          Регистрация
        </button>
      </div>

      {message && <p className="auth__message">{message}</p>}
    </div>
  );
}

export default AuthForm;
