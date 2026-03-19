import React from 'react';
import './header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>FamilyShop</h1>
        </div>
        
        <nav className="nav-menu">
          <ul>
            <li><a href="/">Главная</a></li>
            <li><a href="/catalog">Каталог</a></li>
            <li><a href="/deals">Скидки</a></li>
            <li><a href="/about">О нас</a></li>
          </ul>
        </nav>

        <div className="header-actions">
          <div className="family-group">
            <span className="family-icon">👨‍👩‍👧‍👦</span>
            <span className="family-name">Семья Ивановых</span>
          </div>
          
          <div className="cart-preview">
            <span className="cart-icon">🛒</span>
            <span className="cart-count">3</span>
          </div>
          
          <div className="user-menu">
            <button className="user-btn">
              <span className="user-icon">👤</span>
              <span>Анна</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;