import React from "react";
import "./productCard.css";

const ProductCard = ({
  product,
  onAddToCart,
  onOpen,
  isAuth = true, // добавили
}) => {
  const { id, name, price, oldPrice, image, rating = 0, inCart } = product;

  return (
    <div className="product-card" onClick={() => onOpen?.(product)}>
      {/* IMAGE */}
      <div className="product-image-card">
        <img src={image} alt={name} />

        {oldPrice && (
          <span className="discount-badge">
            -{Math.round(((oldPrice - price) / oldPrice) * 100)}%
          </span>
        )}
      </div>

      {/* INFO */}
      <div className="product-info">
        <h3 className="product-name">{name}</h3>

        <div className="product-rating">
          {[...Array(5)].map((_, index) => (
            <span
              key={index}
              className={index < rating ? "star filled" : "star"}
            >
              ★
            </span>
          ))}
        </div>

        <div className="product-price">
          <span className="current-price">{price.toLocaleString()} ₽</span>

          {oldPrice && (
            <span className="old-price">{oldPrice.toLocaleString()} ₽</span>
          )}
        </div>

        {/* ACTIONS */}
        <div className="product-actions">
          {/*  КНОПКА ТОЛЬКО ДЛЯ AUTH */}
          {isAuth ? (
            <button
              className="add-to-cart-btn"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart?.(id);
              }}
            >
              {inCart ? "✓ В корзине" : "В корзину"}
            </button>
          ) : (
            <button className="add-to-cart-btn disabled" disabled>
              Войдите для покупки
            </button>
          )}

          <button
            className="details-btn"
            onClick={(e) => {
              e.stopPropagation();
              onOpen?.(product);
            }}
          >
            Подробнее
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;