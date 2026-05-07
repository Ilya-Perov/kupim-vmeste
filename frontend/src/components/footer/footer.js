import React from "react";
import "./footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>FamilyShop</h3>
          <p>Покупайте вместе с близкими и экономьте</p>
          <div className="social-links">
            <a href="#" className="social-link">
              📘
            </a>
            <a href="#" className="social-link">
              📷
            </a>
            <a href="#" className="social-link">
              🐦
            </a>
            <a href="#" className="social-link">
              📱
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4>О нас</h4>
          <ul>
            <li>
              <a href="#">О компании</a>
            </li>
            <li>
              <a href="#">Новости</a>
            </li>
            <li>
              <a href="#">Вакансии</a>
            </li>
            <li>
              <a href="#">Контакты</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Покупателям</h4>
          <ul>
            <li>
              <a href="#">Как сделать заказ</a>
            </li>
            <li>
              <a href="#">Доставка и оплата</a>
            </li>
            <li>
              <a href="#">Возврат товара</a>
            </li>
            <li>
              <a href="#">Вопросы и ответы</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Семейные покупки</h4>
          <ul>
            <li>
              <a href="#">Создать группу</a>
            </li>
            <li>
              <a href="#">Пригласить родных</a>
            </li>
            <li>
              <a href="#">Общая корзина</a>
            </li>
            <li>
              <a href="#">История покупок</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 FamilyShop. Все права защищены.</p>
      </div>
    </footer>
  );
};

export default Footer;
