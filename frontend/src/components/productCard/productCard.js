import React from 'react';
import './productCard.css';

const ProductCard = ({ product, onAddToCart, onAddToFamilyCart }) => {
  const { id, name, price, oldPrice, image, rating, inCart, familyMembers } = product;

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={image} alt={name} />
        {oldPrice && (
          <span className="discount-badge">
            -{Math.round(((oldPrice - price) / oldPrice) * 100)}%
          </span>
        )}
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{name}</h3>
        
        <div className="product-rating">
          {[...Array(5)].map((_, index) => (
            <span key={index} className={index < rating ? 'star filled' : 'star'}>
              ★
            </span>
          ))}
          <span className="rating-count">(45)</span>
        </div>
        
        <div className="product-price">
          <span className="current-price">{price.toLocaleString()} ₽</span>
          {oldPrice && (
            <span className="old-price">{oldPrice.toLocaleString()} ₽</span>
          )}
        </div>
        
        <div className="product-actions">
          <button 
            className={`add-to-cart-btn ${inCart ? 'in-cart' : ''}`}
            onClick={() => onAddToCart(id)}
          >
            {inCart ? '✓ В корзине' : 'В корзину'}
          </button>
          
          <div className="family-actions">
            <button 
              className="family-add-btn" 
              title="Добавить в семейную корзину"
              onClick={() => onAddToFamilyCart(id)}
            >
              👨‍👩‍👧‍👦
            </button>
            {familyMembers.length > 0 && (
              <div className="family-members-tooltip">
                <span className="family-members-count">{familyMembers.length}</span>
                <div className="family-members-list">
                  {familyMembers.map((member, index) => (
                    <span key={index} className="family-member">{member}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;