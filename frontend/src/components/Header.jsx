import "../styles/header.css";

function Header({ token, onLogout }) {
  return (
    <header className="header">
      <div className="header__logo">Система распознавания документов</div>

      {token && (
        <button className="header__logout" onClick={onLogout}>
          Выйти
        </button>
      )}
    </header>
  );
}

export default Header;
