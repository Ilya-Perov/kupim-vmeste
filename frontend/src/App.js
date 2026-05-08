import "./App.css";

import Home from "./components/home/home";
import Account from "./components/account/account";
import GroupPage from "./components/groupPage/groupPage";
import LoginPage from "./components/loginPage/loginPage";
import Header from "./components/header/header";
import Catalog from "./components/catalog/catalog";
import OrderPage from "./components/orderPage/orderPage";
import RegisterPage from "./components/registerPage/registerPage";

import { BrowserRouter as Router, Route, Routes } from "react-router";

import { AuthProvider } from "./context/authContext";
import { CartProvider } from "./context/cartContext";
import ProtectedRoute from "./components/protectedRoute";
import PublicRoute from "./components/publicRoute";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Header />

          <Routes>
            {/* PUBLIC */}
            <Route path="/" element={<Home />} />

            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />

            {/* PROTECTED */}
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              }
            />

            <Route
              path="/groups"
              element={
                <ProtectedRoute>
                  <GroupPage />
                </ProtectedRoute>
              }
            />

            <Route path="/catalog" element={<Catalog />} />

            <Route path="/order/:groupId" element={<OrderPage />} />

            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
