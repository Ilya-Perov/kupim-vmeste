import React from "react";
import "./productModal.css";

const ProductModal = ({ isOpen, product, onClose }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <img src={product.image} alt={product.name} className="modal-image" />

        <h2>{product.name}</h2>

        <p>{product.description}</p>

        <div className="modal-price">
          💰 Цена: {product.price.toLocaleString()} ₽
        </div>

        {product.oldPrice && (
          <div>🏷 Старая цена: {product.oldPrice.toLocaleString()} ₽</div>
        )}

        <div className="info-grid">
          <div>⭐ Рейтинг: {product.rating}</div>
          <div>🏷 Категория: {product.category}</div>
          <div>🏭 Бренд: {product.brand}</div>
          <div>📦 В наличии: {product.stock}</div>

          <div>
            {product.is_available ? "🟢 В наличии" : "🔴 Нет в наличии"}
          </div>
        </div>

        <button className="close-btn" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default ProductModal;
