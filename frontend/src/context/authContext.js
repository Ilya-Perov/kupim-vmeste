import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 восстановление пользователя при refresh
  const loadUser = async () => {
    try {
      const token = localStorage.getItem("access");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const res = await fetch("http://localhost:5000/api/users/me/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setUser(data);
    } catch (e) {
      setUser(null);
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();

    // 🔥 слушаем logout из api.js
    const handler = () => {
      setUser(null);
    };

    window.addEventListener("unauthorized", handler);
    return () => window.removeEventListener("unauthorized", handler);
  }, []);

  const login = async (username, password) => {
    const data = await api.login(username, password);
    await loadUser();
    return data;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
