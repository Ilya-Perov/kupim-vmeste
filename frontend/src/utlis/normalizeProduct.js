export const normalizeProduct = (p) => {
  if (!p) return null;

  return {
    id: p.id,
    name: p.name || "—",
    description: p.description || "Нет описания",
    image: p.image || "",

    // цена всегда number
    price: Number(p.price || 0),

    // старая цена унифицирована
    oldPrice: p.old_price ?? p.oldPrice ?? null,

    rating: Number(p.rating || 0),

    category: p.category || "—",
    brand: p.brand || "—",
    stock: p.stock ?? 0,

    is_available: p.is_available ?? true,
  };
};
