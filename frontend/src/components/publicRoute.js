import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const PublicRoute = ({ children }) => {
  const { user } = useAuth();

  // если уже авторизован → не пускаем на login/register
  if (user) {
    return <Navigate to="/account" replace />;
  }

  return children;
};

export default PublicRoute;
