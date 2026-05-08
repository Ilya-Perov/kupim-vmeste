import React, { useEffect, useState } from "react";
import { api } from "../../api";
import ProductCard from "../productCard/productCard";
import ProductModal from "../common/modals/productModal/productModal";
import { normalizeProduct } from "../../utils/normalizeProduct";
import { useAuth } from "../../context/authContext";
import "./catalog.css";

const Catalog = () => {
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);

  const [cart, setCart] = useState(null); //  ВОТ ЭТО НЕ ХВАТАЛО

  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // =====================
  // LOAD CART
  // =====================
  const loadCart = async (groupId) => {
    if (!groupId || !user) return;

    try {
      const data = await api.getCart(groupId);
      setCart(data);
    } catch (e) {
      console.error("Cart load error:", e);
      setCart(null);
    }
  };

  // =====================
  // LOAD DATA
  // =====================
  const loadData = async () => {
    try {
      const productsData = await api.getProducts();
      setProducts(Array.isArray(productsData) ? productsData : []);

      if (user) {
        const groupsData = await api.getMyGroups();

        const safeGroups = Array.isArray(groupsData)
          ? groupsData
          : groupsData?.results || [];

        setGroups(safeGroups);

        if (safeGroups.length > 0) {
          setActiveGroup(safeGroups[0]);
          await loadCart(safeGroups[0].id); //  теперь грузим корзину
        }
      }
    } catch (e) {
      console.error("Catalog load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

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
    if (!user || !activeGroup) return;

    try {
      await api.addToCart(productId, activeGroup.id);
      await loadCart(activeGroup.id); //  обновляем
    } catch (e) {
      console.error(e);
    }
  };

  const isAuth = !!user;

  if (loading) return <div className="loading">Загрузка каталога...</div>;

  return (
    <div className="catalog">
      <div className="catalog-header">
        <h1>🛍 Каталог товаров</h1>

        {isAuth && (
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
        )}
      </div>

      {!isAuth && (
        <div className="guest-info">👋 Гость — корзина недоступна</div>
      )}

      <div className="catalog-layout">
        {/* PRODUCTS */}
        <div className="catalog-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={isAuth ? handleAddToCart : undefined}
              onOpen={(p) => setSelectedProduct(normalizeProduct(p))}
              isAuth={isAuth}
            />
          ))}
        </div>

        {/* CART */}
        {isAuth && (
          <aside className="cart-sidebar">
            <h3>🛒 Корзина группы</h3>

            {!cart?.items?.length ? (
              <p className="muted">Корзина пуста</p>
            ) : (
              cart.items.map((item) => (
                <div key={item.id} className="cart-item">
                  {item.product.name} × {item.quantity}
                </div>
              ))
            )}
          </aside>
        )}
      </div>

      <ProductModal
        isOpen={!!selectedProduct}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};

export default Catalog;
