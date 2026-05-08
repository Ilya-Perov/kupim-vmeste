import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/authContext";
import "./loginPage.css";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await login(username, password);
      navigate("/", { replace: true });
    } catch {
      alert("Ошибка входа");
    }
  };

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

        <button className="login-button" onClick={handleLogin}>
          Войти
        </button>
      </div>
    </div>
  );
};

export default Login;
