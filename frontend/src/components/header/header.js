import React from "react";
import "./header.css";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../context/authContext";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <h1>FamilyShop</h1>
          </Link>
        </div>

        <nav className="nav-menu">
          <ul>
            <li>
              <Link to="/">Главная</Link>
            </li>
            <li>
              <Link to="/account">Аккаунт</Link>
            </li>
            <li>
              <Link to="/groups">Группы</Link>
            </li>
          </ul>
        </nav>

        <div className="user-box">
          {user && (
            <>
              <span className="username">👤 {user.username}</span>
              <button className="logout-btn" onClick={handleLogout}>
                Выйти
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
