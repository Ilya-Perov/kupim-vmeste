import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { api } from "../../api";
import "./orderPage.css";

const OrderPage = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();

  const [cart, setCart] = useState(null);

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // =====================
  // LOAD CART
  // =====================
  useEffect(() => {
    const load = async () => {
      try {
        if (!groupId) return;

        const data = await api.getCart(groupId);
        setCart(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [groupId]);

  // =====================
  // VALIDATION
  // =====================
  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Введите имя";
    if (!form.address.trim()) newErrors.address = "Введите адрес";

    if (!form.phone.trim()) {
      newErrors.phone = "Введите телефон";
    } else if (!/^\+?[0-9]{7,15}$/.test(form.phone)) {
      newErrors.phone = "Некорректный телефон";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =====================
  // ORDER
  // =====================
  const handleOrder = async () => {
    if (!form.name || !form.address || !form.phone) {
      alert("Заполни все поля");
      return;
    }

    try {
      await api.checkoutCart(groupId);

      setSuccess(true);

      setTimeout(() => {
        navigate("/groups");
      }, 1500);
    } catch (e) {
      console.error(e);
    }
  };

  // =====================
  // LOADING
  // =====================
  if (loading) return <div className="checkout">Загрузка...</div>;

  return (
    <div className="checkout">
      <h1>Оформление заказа</h1>

      {/* CART */}
      <div className="checkout-cart">
        {cart?.items?.length ? (
          cart.items.map((item) => (
            <div key={item.id} className="checkout-item">
              {item.product.name} × {item.quantity}
            </div>
          ))
        ) : (
          <p>Корзина пуста</p>
        )}
      </div>

      {/* FORM */}
      <div className="checkout-form">
        <input
          placeholder="Имя"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        {errors.name && <span className="error">{errors.name}</span>}

        <input
          placeholder="Адрес"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        {errors.address && <span className="error">{errors.address}</span>}

        <input
          placeholder="Телефон"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        {errors.phone && <span className="error">{errors.phone}</span>}

        <button onClick={handleOrder}>Заказать</button>

        {success && <div className="success">✅ Заказ оформлен!</div>}
      </div>
    </div>
  );
};

export default OrderPage;
