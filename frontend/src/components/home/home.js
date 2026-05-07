import React, { useState, useEffect } from "react";
import { useCart } from "../../context/cartContext";
import { useNavigate } from "react-router";
import Footer from "../footer/footer";
import ProductCard from "../productCard/productCard";
import FamilyGroup from "../familyGroup/familyGroup";
import { api } from "../../api";
import "./home.css";

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🛒 Загружаем продукты из backend
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await api.getProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // 📦 категории (пока статические)
  const categories = [
    { name: "Электроника", icon: "📱", count: 45 },
    { name: "Бытовая техника", icon: "🔧", count: 32 },
    { name: "Одежда", icon: "👕", count: 28 },
    { name: "Детям", icon: "🧸", count: 19 },
    { name: "Спорт", icon: "⚽", count: 24 },
    { name: "Красота", icon: "💄", count: 16 },
  ];

  // ➕ добавить в общую (групповую) корзину
  const { addToCart } = useCart();

  const handleAddToCart = async (id) => {
    try {
      await addToCart(id);
    } catch (e) {
      console.error(e);
    }
  };

  // 👨‍👩‍👧‍👦 добавить в семейную корзину (та же логика)
  const handleAddToFamilyCart = async (productId) => {
    await handleAddToCart(productId);
    console.log(`Товар ${productId} добавлен в семейную корзину`);
  };

  if (loading) {
    return <div className="loading">Загрузка товаров...</div>;
  }

  return (
    <div className="home">
      <main className="main-content">
        {/* HERO */}
        <section className="hero-section">
          <div className="hero-content">
            <h1>Семейный шопинг с выгодой</h1>
            <p>Объединяйтесь с близкими и покупайте вместе</p>
            <button className="cta-btn" onClick={() => navigate("/account")}>
              Начать покупки
            </button>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="categories-section">
          <div className="section-header">
            <h2>Популярные категории</h2>
            <a href="/catalog" className="view-all">
              Все категории →
            </a>
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

        {/* MAIN CONTENT */}
        <div className="content-wrapper">
          {/* PRODUCTS */}
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
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    oldPrice: product.old_price || null,
                    inCart: false,
                    familyMembers: [],
                  }}
                  onAddToCart={handleAddToCart}
                  onAddToFamilyCart={handleAddToFamilyCart}
                />
              ))}
            </div>

            <button className="load-more-btn">Загрузить еще</button>
          </div>

          {/* SIDEBAR */}
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
