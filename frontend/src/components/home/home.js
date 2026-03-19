import React from 'react';
import { useNavigate } from 'react-router';
import Header from '../header/header';
import Footer from '../footer/footer';
import ProductCard from '../productCard/productCard';
import FamilyGroup from '../familyGroup/familyGroup';
import './home.css';

const Home = () => {
  const navigate = useNavigate();

  const products = [
    {
      id: 1,
      name: 'Смартфон Xiaomi Redmi Note 12',
      price: 24990,
      oldPrice: 29990,
      image: 'https://via.placeholder.com/300x200',
      rating: 4,
      inCart: false,
      familyMembers: ['Анна', 'Миша']
    },
    {
      id: 2,
      name: 'Наушники Sony WH-1000XM4',
      price: 27990,
      oldPrice: null,
      image: 'https://via.placeholder.com/300x200',
      rating: 5,
      inCart: true,
      familyMembers: ['Анна']
    },
    {
      id: 3,
      name: 'Робот-пылесос Xiaomi Vacuum',
      price: 18990,
      oldPrice: 22990,
      image: 'https://via.placeholder.com/300x200',
      rating: 4,
      inCart: false,
      familyMembers: ['Алексей', 'Катя']
    },
    {
      id: 4,
      name: 'Планшет Samsung Tab S8',
      price: 45990,
      oldPrice: 49990,
      image: 'https://via.placeholder.com/300x200',
      rating: 5,
      inCart: false,
      familyMembers: []
    },
    {
      id: 5,
      name: 'Умная колонка Яндекс Станция',
      price: 12990,
      oldPrice: 14990,
      image: 'https://via.placeholder.com/300x200',
      rating: 4,
      inCart: false,
      familyMembers: ['Миша']
    },
    {
      id: 6,
      name: 'Фитнес-браслет Xiaomi Mi Band 8',
      price: 3990,
      oldPrice: 4990,
      image: 'https://via.placeholder.com/300x200',
      rating: 4,
      inCart: false,
      familyMembers: []
    }
  ];

  const categories = [
    { name: 'Электроника', icon: '📱', count: 45 },
    { name: 'Бытовая техника', icon: '🔧', count: 32 },
    { name: 'Одежда', icon: '👕', count: 28 },
    { name: 'Детям', icon: '🧸', count: 19 },
    { name: 'Спорт', icon: '⚽', count: 24 },
    { name: 'Красота', icon: '💄', count: 16 }
  ];

  const handleAddToCart = (productId) => {
    console.log(`Товар ${productId} добавлен в корзину`);
    // Здесь будет логика добавления в корзину
  };

  const handleAddToFamilyCart = (productId) => {
    console.log(`Товар ${productId} добавлен в семейную корзину`);
    // Здесь будет логика добавления в семейную корзину
  };

  return (
    <div className="home">
      <Header />
      
      <main className="main-content">
        {/* Hero секция */}
        <section className="hero-section">
          <div className="hero-content">
            <h1>Семейный шопинг с выгодой</h1>
            <p>Объединяйтесь с близкими и покупайте вместе</p>
            <button className="cta-btn" onClick={() => navigate('/account')}>
              Начать покупки
            </button>
          </div>
        </section>

        {/* Категории */}
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

        {/* Основной контент с товарами и виджетом семейной группы */}
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
                  product={product}
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