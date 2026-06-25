import { products } from "./products.js";
import { loadCart, saveCart } from "./store.js";

export const state = {
  products,
  cart: loadCart(),
  filters: {
    search: "",
    category: "All",
    sort: "featured"
  }
};

export function getCartCount() {
  return state.cart.reduce((total, item) => total + item.quantity, 0);
}

export function getCartItems() {
  return state.cart
    .map((item) => {
      const product = state.products.find((candidate) => candidate.id === item.productId);
      return product ? { ...product, quantity: item.quantity } : null;
    })
    .filter(Boolean);
}

export function getCartSubtotal() {
  return getCartItems().reduce((total, item) => total + item.price * item.quantity, 0);
}

export function addToCart(productId) {
  const existing = state.cart.find((item) => item.productId === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({ productId, quantity: 1 });
  }

  saveCart(state.cart);
}

export function incrementItem(productId) {
  addToCart(productId);
}

export function decrementItem(productId) {
  state.cart = state.cart
    .map((item) => item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item)
    .filter((item) => item.quantity > 0);

  saveCart(state.cart);
}

export function removeItem(productId) {
  state.cart = state.cart.filter((item) => item.productId !== productId);
  saveCart(state.cart);
}

export function clearCart() {
  state.cart = [];
  saveCart(state.cart);
}
