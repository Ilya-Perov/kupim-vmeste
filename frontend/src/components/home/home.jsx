import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { normalizeProduct } from "../../utils/normalizeProduct";
import Footer from "../footer/footer";
import ProductCard from "../productCard/productCard";
import { api } from "../../api";
import { useCart } from "../../context/cartContext";
import { useAuth } from "../../context/authContext";
import "./home.css";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const isAuth = !!user;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState(null);

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

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId);
    } catch (e) {
      console.error("Add to cart error:", e);
    }
  };

  const openModal = (product) => {
    console.log("CLICK PRODUCT:", product);
    setSelectedProduct(normalizeProduct(product));
  };

  const closeModal = () => {
    setSelectedProduct(null);
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
            <p>Объединяйтесь с группой и покупайте вместе</p>

            <button className="cta-btn" onClick={() => navigate("/catalog")}>
              Начать покупки
            </button>
          </div>
        </section>

        {/* PRODUCTS */}
        <section className="products-section">
          <div className="section-header">
            <h2>Рекомендуем для группы</h2>
          </div>

          <div className="products-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                mode="cart"
                onAddToCart={isAuth ? handleAddToCart : undefined}
                onOpen={openModal}
                isAuth={isAuth}
              />
            ))}
          </div>
        </section>
      </main>

      {selectedProduct && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="modal-image"
            />

            <h2>{selectedProduct.name}</h2>

            <p>{selectedProduct.description}</p>

            <div className="modal-price">
              {selectedProduct.price.toLocaleString()} ₽
            </div>

            <button className="close-btn" onClick={closeModal}>
              Закрыть
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Home;
