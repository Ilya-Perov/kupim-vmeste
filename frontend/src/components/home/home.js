import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Header from '../header/header';
import Footer from '../footer/footer';
import ProductCard from '../productCard/productCard';
import FamilyGroup from '../familyGroup/familyGroup';
import './home.css';

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Загружаем продукты из БД
  useEffect(() => {
    fetch(`/api/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading products:', error);
        setLoading(false);
      });
  }, []);

  const categories = [
    { name: 'Электроника', icon: '📱', count: 45 },
    { name: 'Бытовая техника', icon: '🔧', count: 32 },
    { name: 'Одежда', icon: '👕', count: 28 },
    { name: 'Детям', icon: '🧸', count: 19 },
    { name: 'Спорт', icon: '⚽', count: 24 },
    { name: 'Красота', icon: '💄', count: 16 }
  ];

  const handleAddToCart = async (productId) => {
    // Для демо добавляем первому члену семьи (id=1)
    try {
      await fetch(`/api/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, member_id: 1 })
      });
      console.log(`Товар ${productId} добавлен в корзину`);
      // Обновляем FamilyGroup через событие
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleAddToFamilyCart = async (productId) => {
    await handleAddToCart(productId);
    console.log(`Товар ${productId} добавлен в семейную корзину`);
  };

  if (loading) {
    return <div className="loading">Загрузка товаров...</div>;
  }

  return (
    <div className="home">
      <Header />
      
      <main className="main-content">
        <section className="hero-section">
          <div className="hero-content">
            <h1>Семейный шопинг с выгодой</h1>
            <p>Объединяйтесь с близкими и покупайте вместе</p>
            <button className="cta-btn" onClick={() => navigate('/account')}>
              Начать покупки
            </button>
          </div>
        </section>

        <section className="categories-section">
          <div className="section-header">
            <h2>Популярные категории</h2>
            <a href="/catalog" className="view-all">Все категории →</a>
          </div>
          
          <div className="categories-grid">
            {categories.map((category, index) => (
              <div key={index} className="category-card">
                <span className="category-icon">{category.icon}</span>
                <h3>{category.name}</h3>
                <span className="category-count">{category.count} товаров</span>
              </div>
            ))}
          </div>
        </section>

        <div className="content-wrapper">
          <div className="products-section">
            <div className="section-header">
              <h2>Рекомендуем для семьи</h2>
              <div className="products-filter">
                <select className="filter-select">
                  <option>По популярности</option>
                  <option>По цене (возрастание)</option>
                  <option>По цене (убывание)</option>
                  <option>По новизне</option>
                </select>
              </div>
            </div>
            
            <div className="products-grid">
              {products.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={{
                    ...product,
                    oldPrice: product.old_price,
                    inCart: false,
                    familyMembers: []
                  }}
                  onAddToCart={handleAddToCart}
                  onAddToFamilyCart={handleAddToFamilyCart}
                />
              ))}
            </div>
            
            <button className="load-more-btn">Загрузить еще</button>
          </div>
          
          <aside className="sidebar">
            <FamilyGroup />
            
            <div className="special-offers">
              <h3>Специальные предложения</h3>
              <div className="offer-card">
                <span className="offer-tag">Семейный набор</span>
                <h4>Скидка 15% на технику для дома</h4>
                <p>При покупке от 3 товаров</p>
                <button className="offer-btn">Подробнее</button>
              </div>
              
              <div className="offer-card">
                <span className="offer-tag">Акция</span>
                <h4>2=3 на детские товары</h4>
                <p>При покупке двух товаров, третий в подарок</p>
                <button className="offer-btn">Подробнее</button>
              </div>
            </div>
          </aside>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;