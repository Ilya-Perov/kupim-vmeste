import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/authContext";
import "./loginPage.css";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Введите логин и пароль");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await login(username, password);

      navigate("/", { replace: true });
    } catch (e) {
      setError("Неверный логин или пароль");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => setError(null);

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Вход</h2>

        <input
          className="login-input"
          placeholder="Логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="login-input"
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="login-button"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Входим..." : "Войти"}
        </button>
        <button
          className="register-link-btn"
          onClick={() => navigate("/register")}
        >
          Нет аккаунта? Зарегистрироваться
        </button>
      </div>

      {error && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-card error-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-icon">⚠️</div>

            <h3>Ошибка входа</h3>

            <p className="modal-text">{error}</p>

            <button onClick={closeModal} className="modal-btn">
              Понятно
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
