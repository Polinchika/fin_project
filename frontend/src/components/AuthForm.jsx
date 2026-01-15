import "../styles/auth.css";

export default function AuthForm({
  username,
  password,
  setUsername,
  setPassword,
  onRegister,
  onLogin,
  message,
}) {
  return (
    <div className="auth-form">
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="auth-actions">
        <button className="btn-secondary" onClick={onRegister}>
          Register
        </button>
        <button className="btn-primary" onClick={onLogin}>
          Login
        </button>
      </div>

      {message && <div className="message">{message}</div>}
    </div>
  );
}
