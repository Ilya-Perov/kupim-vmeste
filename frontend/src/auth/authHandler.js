import { useEffect } from "react";
import { useNavigate } from "react-router";

const AuthHandler = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => {
      navigate("/account"); // или "/login" если есть страница логина
    };

    window.addEventListener("unauthorized", handler);

    return () => {
      window.removeEventListener("unauthorized", handler);
    };
  }, [navigate]);

  return children;
};

export default AuthHandler;
