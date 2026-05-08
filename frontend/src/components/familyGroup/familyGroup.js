import { useCart } from "../../context/cartContext";

const FamilyGroup = () => {
  const { cart, loading } = useCart();

  if (loading) return <div>Загрузка...</div>;

  const items = cart?.items || [];

  return (
    <div className="family-group-widget">
      <h3>Семейная корзина</h3>

      <div>Всего товаров: {items.reduce((s, i) => s + i.quantity, 0)}</div>

      {items.map((item) => (
        <div key={item.id}>
          {item.product.name} × {item.quantity}
        </div>
      ))}
    </div>
  );
};

export default FamilyGroup;
