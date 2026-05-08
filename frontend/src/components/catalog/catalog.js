import React, { useEffect, useState } from "react";
import { api } from "../../api";
import ProductCard from "../productCard/productCard";
import ProductModal from "../common/modals/productModal/productModal";
import { normalizeProduct } from "../../utlis/normalizeProduct";
import "./catalog.css";

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState(null);

  // =====================
  // LOAD DATA
  // =====================
  const loadCart = async (groupId) => {
    try {
      const data = await api.getCart(groupId);
      setCart(data);
    } catch (e) {
      console.error("Cart load error:", e);
      setCart(null);
    }
  };

  const loadData = async () => {
    try {
      const [productsData, groupsData] = await Promise.all([
        api.getProducts(),
        api.getMyGroups(),
      ]);

      setProducts(Array.isArray(productsData) ? productsData : []);

      const safeGroups = Array.isArray(groupsData)
        ? groupsData
        : groupsData?.results || [];

      setGroups(safeGroups);

      if (safeGroups.length > 0) {
        setActiveGroup(safeGroups[0]);
        await loadCart(safeGroups[0].id);
      }
    } catch (e) {
      console.error("Catalog load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =====================
  // MODAL
  // =====================
  const openModal = (product) => {
    setSelectedProduct(normalizeProduct(product));
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  // =====================
  // CHANGE GROUP
  // =====================
  const handleSelectGroup = async (group) => {
    setActiveGroup(group);
    await loadCart(group.id);
  };

  // =====================
  // ADD TO CART
  // =====================
  const handleAddToCart = async (productId) => {
    if (!activeGroup) return;

    try {
      await api.addToCart(productId);
      await loadCart(activeGroup.id);
    } catch (e) {
      console.error(e);
    }
  };

  // =====================
  // REMOVE FROM CART
  // =====================
  const handleRemove = async (productId) => {
    if (!activeGroup) return;

    try {
      await api.removeFromCart(productId);
      await loadCart(activeGroup.id);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка каталога...</div>;
  }

  return (
    <div className="catalog">
      {/* HEADER */}
      <div className="catalog-header">
        <h1>🛍 Каталог товаров</h1>

        <div className="group-selector">
          <label>Группа:</label>

          <select
            value={activeGroup?.id || ""}
            onChange={(e) =>
              handleSelectGroup(
                groups.find((g) => g.id === Number(e.target.value)),
              )
            }
          >
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* LAYOUT */}
      <div className="catalog-layout">
        {/* PRODUCTS */}
        <div className="catalog-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              mode="cart"
              onAddToCart={handleAddToCart}
              onOpen={openModal} // 🔥 ВАЖНО
            />
          ))}
        </div>

        {/* CART SIDEBAR */}
        <aside className="cart-sidebar">
          <h3>🛒 Корзина группы</h3>

          {!cart || !cart.items?.length ? (
            <p className="muted">Корзина пуста</p>
          ) : (
            cart.items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <span className="cart-name">{item.product.name}</span>
                  <span className="cart-qty">x{item.quantity}</span>
                </div>

                <button
                  className="remove-btn"
                  onClick={() => handleRemove(item.product.id)}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </aside>
      </div>

      <ProductModal
        isOpen={!!selectedProduct}
        product={selectedProduct}
        onClose={closeModal}
      />
    </div>
  );
};

export default Catalog;
