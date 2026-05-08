import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const data = await api.getMe();
      setUser(data);
    } catch {
      setUser(null);
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();

    //  слушаем logout из api.js
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
