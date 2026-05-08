const API_URL = "http://localhost:5000/api";

const getToken = () => localStorage.getItem("access");

const logout = () => {
  localStorage.clear();
  window.dispatchEvent(new Event("unauthorized"));
};

const request = async (url, options = {}) => {
  const token = getToken();

  const res = await fetch(`${API_URL}/${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  let data = null;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (res.status === 401) {
    logout();
    return;
  }

  if (!res.ok) {
    throw new Error(data?.detail || "API Error");
  }

  return data;
};

export const api = {
  // =====================
  // AUTH
  // =====================
  login: async (username, password) => {
    const res = await fetch(`${API_URL}/auth/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Login error");
    }

    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);

    return data;
  },

  logout,

  register: async (username, password) => {
    const res = await fetch(`${API_URL}/users/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.detail || "Register error");
    }

    return data;
  },

  // =====================
  // USERS
  // =====================
  getMe: () => request("users/me/"),

  searchUsers: (query) =>
    request(`users/search/?q=${encodeURIComponent(query)}`),

  // =====================
  // PRODUCTS
  // =====================
  getProducts: () => request("products/"),

  // =====================
  // CART
  // =====================

  //  ВАЖНО: group_id передаем query param
  getCart: (groupId) => request(`cart/my_cart/?group_id=${groupId}`),

  addToCart: (product_id, group_id) =>
    request("cart/add/", {
      method: "POST",
      body: JSON.stringify({
        product_id,
        group_id,
      }),
    }),

  removeFromCart: (product_id, group_id) =>
    request("cart/remove/", {
      method: "POST",
      body: JSON.stringify({
        product_id,
        group_id,
      }),
    }),

  // =====================
  // GROUPS
  // =====================
  getMyGroups: () => request("my-groups/"),

  createGroup: (name) =>
    request("my-groups/", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  getGroupMembers: (groupId) => request(`my-groups/${groupId}/members/`),

  // =====================
  // INVITES
  // =====================
  inviteUser: (groupId, username) =>
    request("invitations/", {
      method: "POST",
      body: JSON.stringify({
        group: groupId,
        receiver_username: username,
      }),
    }),

  getInvites: () => request("invitations/"),

  acceptInvite: (id) =>
    request(`invitations/${id}/accept/`, {
      method: "POST",
    }),

  declineInvite: (id) =>
    request(`invitations/${id}/decline/`, {
      method: "POST",
    }),

  checkoutCart: (group_id) =>
    request("cart/checkout/", {
      method: "POST",
      body: JSON.stringify({ group_id }),
    }),
};
