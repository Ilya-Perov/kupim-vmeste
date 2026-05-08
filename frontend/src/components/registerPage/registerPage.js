import React, { useState } from "react";
import { useNavigate } from "react-router";
import { api } from "../../api";
import "../loginPage/loginPage.css";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !password) {
      setError("Заполните все поля");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await api.register(username, password);

      navigate("/login");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Регистрация</h2>

        <input
          placeholder="Логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleRegister} disabled={loading}>
          {loading ? "Создание..." : "Создать аккаунт"}
        </button>

        {error && <div className="error">{error}</div>}

        <p
          style={{ marginTop: 10, cursor: "pointer", color: "#667eea" }}
          onClick={() => navigate("/login")}
        >
          Уже есть аккаунт? Войти
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
