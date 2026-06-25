import {
  state,
  getCartItems,
  getCartSubtotal,
  getCartCount,
  addToCart,
  incrementItem,
  decrementItem,
  removeItem,
  clearCart
} from "./state.js";
import { formatCurrency, escapeHtml, normalize, qs, qsa, scrollToTop } from "./utils.js";

const app = qs("#app");
const toast = document.createElement("div");
toast.className = "toast";
toast.setAttribute("role", "status");
toast.setAttribute("aria-live", "polite");
document.body.appendChild(toast);

let toastTimer = null;

export function renderHome() {
  app.innerHTML = `
    <section class="hero">
      <div class="container hero-grid">
        <div class="glass-panel">
          <p class="eyebrow">Full-Stack Deployment & Project Architecture</p>
          <h1>Professional e-commerce catalog.</h1>
          <p class="lead">
            NovaCart is a production-ready static SPA that demonstrates modular frontend architecture,
            client-side routing, optimized assets, product filtering, cart state, and deploy-ready configuration.
          </p>
          <div class="actions">
            <a class="button" href="#/products">Shop products →</a>
            <a class="ghost-button" href="#/about">View architecture</a>
          </div>
        </div>

        <aside class="glass-panel">
          <p class="eyebrow">Capstone Metrics</p>
          <div class="stats-grid">
            <article class="stat-card">
              <span class="stat-value">${state.products.length}</span>
              <span class="stat-label">Products</span>
            </article>
            <article class="stat-card">
              <span class="stat-value">4</span>
              <span class="stat-label">Routes</span>
            </article>
            <article class="stat-card">
              <span class="stat-value">0</span>
              <span class="stat-label">Frameworks</span>
            </article>
          </div>
          <p class="muted">Runs on GitHub Pages, Netlify, Vercel, or Render as a static production app.</p>
        </aside>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header">
          <p class="eyebrow">Featured</p>
          <h2>Popular products</h2>
          <p class="muted">Rendered dynamically from modular JavaScript data.</p>
        </div>
        <div class="product-grid" data-product-grid></div>
      </div>
    </section>
  `;

  renderProductCards(state.products.slice(0, 3), qs("[data-product-grid]"));
  bindAddButtons();
  scrollToTop();
}

export function renderProducts() {
  const categories = ["All", ...new Set(state.products.map((product) => product.category))];

  app.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="section-header">
          <p class="eyebrow">Catalog</p>
          <h1>Browse products.</h1>
          <p class="lead">Search, filter, sort, open details, and add products to a persistent localStorage cart.</p>
        </div>

        <div class="catalog-layout">
          <aside class="filter-card" aria-labelledby="filters-title">
            <h2 id="filters-title">Filters</h2>
            <div class="controls-grid">
              <div class="input-field">
                <label for="search">Search</label>
                <input id="search" type="search" value="${escapeHtml(state.filters.search)}" placeholder="Search products..." data-search>
              </div>

              <div class="input-field">
                <label for="category">Category</label>
                <select id="category" data-category>
                  ${categories.map((category) => `
                    <option value="${escapeHtml(category)}" ${category === state.filters.category ? "selected" : ""}>${escapeHtml(category)}</option>
                  `).join("")}
                </select>
              </div>

              <div class="input-field">
                <label for="sort">Sort</label>
                <select id="sort" data-sort>
                  <option value="featured" ${state.filters.sort === "featured" ? "selected" : ""}>Featured</option>
                  <option value="price-low" ${state.filters.sort === "price-low" ? "selected" : ""}>Price: Low to High</option>
                  <option value="price-high" ${state.filters.sort === "price-high" ? "selected" : ""}>Price: High to Low</option>
                  <option value="rating" ${state.filters.sort === "rating" ? "selected" : ""}>Highest Rated</option>
                </select>
              </div>
            </div>
          </aside>

          <section aria-labelledby="results-title">
            <div class="section-header">
              <h2 id="results-title">Results</h2>
              <p class="muted" data-results-count></p>
            </div>
            <div class="product-grid" data-product-grid></div>
          </section>
        </div>
      </div>
    </section>
  `;

  bindFilters();
  updateProductResults();
  scrollToTop();
}

export function renderProductDetail(productId) {
  const product = state.products.find((item) => item.id === productId);

  if (!product) {
    renderNotFound();
    return;
  }

  app.innerHTML = `
    <section class="section">
      <div class="container product-detail-grid">
        <img class="detail-image" src="${product.image}" width="640" height="420" alt="${escapeHtml(product.name)}">

        <article class="glass-panel">
          <p class="eyebrow">${escapeHtml(product.category)}</p>
          <h1>${escapeHtml(product.name)}</h1>
          <p class="lead">${escapeHtml(product.description)}</p>
          <p class="price">${formatCurrency(product.price)}</p>
          <p class="muted">Rating: ⭐ ${product.rating}</p>

          <h2>Key features</h2>
          <ul class="feature-list">
            ${product.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("")}
          </ul>

          <div class="actions">
            <button class="button" type="button" data-add-to-cart="${product.id}">Add to cart</button>
            <a class="ghost-button" href="#/products">Back to catalog</a>
          </div>
        </article>
      </div>
    </section>
  `;

  bindAddButtons();
  scrollToTop();
}

export function renderCart() {
  const items = getCartItems();
  const subtotal = getCartSubtotal();
  const shipping = subtotal > 0 ? 99 : 0;
  const total = subtotal + shipping;

  app.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="section-header">
          <p class="eyebrow">Cart</p>
          <h1>Your cart.</h1>
          <p class="lead">Cart data is persisted in localStorage and survives browser reloads.</p>
        </div>

        ${items.length === 0 ? `
          <div class="empty-state">
            <div>
              <h2>Your cart is empty.</h2>
              <p class="muted">Add products from the catalog to see them here.</p>
              <a class="button" href="#/products">Browse products</a>
            </div>
          </div>
        ` : `
          <div class="cart-layout">
            <section class="cart-card" aria-labelledby="cart-items-title">
              <h2 id="cart-items-title">Cart items</h2>
              <div class="cart-list">
                ${items.map(renderCartItem).join("")}
              </div>
            </section>

            <aside class="summary-card" aria-labelledby="summary-title">
              <h2 id="summary-title">Order summary</h2>
              <div class="summary-line"><span>Subtotal</span><strong>${formatCurrency(subtotal)}</strong></div>
              <div class="summary-line"><span>Shipping</span><strong>${formatCurrency(shipping)}</strong></div>
              <div class="summary-line total"><span>Total</span><strong>${formatCurrency(total)}</strong></div>
              <div class="actions">
                <button class="button" type="button" data-checkout>Checkout demo</button>
                <button class="ghost-button" type="button" data-clear-cart>Clear cart</button>
              </div>
            </aside>
          </div>
        `}
      </div>
    </section>
  `;

  bindCartActions();
  scrollToTop();
}

export function renderAbout() {
  app.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="about-card">
          <p class="eyebrow">Architecture</p>
          <h1>Production-ready frontend structure.</h1>
          <p class="lead">
            This capstone uses modular vanilla JavaScript, client-side hash routing, reusable view renderers,
            localStorage state, optimized SVG assets, responsive CSS, and static deployment configuration.
          </p>

          <div class="stats-grid">
            <article class="stat-card">
              <span class="stat-value">SPA</span>
              <span class="stat-label">Client-side routing</span>
            </article>
            <article class="stat-card">
              <span class="stat-value">ESM</span>
              <span class="stat-label">JavaScript modules</span>
            </article>
            <article class="stat-card">
              <span class="stat-value">SVG</span>
              <span class="stat-label">Optimized images</span>
            </article>
          </div>

          <h2>Implemented capstone features</h2>
          <ul class="feature-list">
            <li>Modular frontend application architecture.</li>
            <li>Client-side routing for Home, Products, Product Detail, Cart, and About pages.</li>
            <li>Search, category filter, sorting, and dynamic product rendering.</li>
            <li>Cart state management with localStorage persistence.</li>
            <li>Optimized lightweight SVG product images.</li>
            <li>Responsive mobile-first layout with CSS Grid and Flexbox.</li>
            <li>Deployment-ready files for Netlify, Vercel, Render, and GitHub Pages.</li>
          </ul>
        </div>
      </div>
    </section>
  `;
  scrollToTop();
}

export function renderNotFound() {
  app.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="empty-state">
          <div>
            <p class="eyebrow">404</p>
            <h1>Page not found.</h1>
            <p class="lead">The route you opened does not exist.</p>
            <a class="button" href="#/">Go home</a>
          </div>
        </div>
      </div>
    </section>
  `;
  scrollToTop();
}

function renderProductCards(products, container) {
  const template = qs("#product-card-template");
  const fragment = document.createDocumentFragment();

  products.forEach((product) => {
    const node = template.content.cloneNode(true);
    const card = qs(".product-card", node);
    const imageLink = qs("[data-product-link]", node);
    const titleLink = qs("[data-product-title-link]", node);
    const image = qs(".product-image", node);

    card.dataset.productId = product.id;
    imageLink.href = `#/products/${product.id}`;
    titleLink.href = `#/products/${product.id}`;
    titleLink.textContent = product.name;
    image.src = product.image;
    image.alt = product.name;

    qs("[data-category]", node).textContent = product.category;
    qs("[data-rating]", node).textContent = `⭐ ${product.rating}`;
    qs("[data-description]", node).textContent = product.description;
    qs("[data-price]", node).textContent = formatCurrency(product.price);
    qs("[data-add-to-cart]", node).dataset.addToCart = product.id;

    fragment.appendChild(node);
  });

  container.replaceChildren(fragment);
}

function bindFilters() {
  qs("[data-search]").addEventListener("input", (event) => {
    state.filters.search = event.target.value;
    updateProductResults();
  });

  qs("[data-category]").addEventListener("change", (event) => {
    state.filters.category = event.target.value;
    updateProductResults();
  });

  qs("[data-sort]").addEventListener("change", (event) => {
    state.filters.sort = event.target.value;
    updateProductResults();
  });
}

function updateProductResults() {
  let results = [...state.products];
  const search = normalize(state.filters.search);

  if (search) {
    results = results.filter((product) => {
      return normalize(product.name).includes(search)
        || normalize(product.description).includes(search)
        || normalize(product.category).includes(search);
    });
  }

  if (state.filters.category !== "All") {
    results = results.filter((product) => product.category === state.filters.category);
  }

  if (state.filters.sort === "price-low") {
    results.sort((a, b) => a.price - b.price);
  }

  if (state.filters.sort === "price-high") {
    results.sort((a, b) => b.price - a.price);
  }

  if (state.filters.sort === "rating") {
    results.sort((a, b) => b.rating - a.rating);
  }

  qs("[data-results-count]").textContent = `${results.length} ${results.length === 1 ? "product" : "products"} found.`;

  const grid = qs("[data-product-grid]");
  if (results.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div>
          <h2>No products found.</h2>
          <p class="muted">Try changing your search or filters.</p>
        </div>
      </div>
    `;
    return;
  }

  renderProductCards(results, grid);
  bindAddButtons();
}

function bindAddButtons() {
  qsa("[data-add-to-cart]").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.dataset.addToCart;
      const product = state.products.find((item) => item.id === productId);
      addToCart(productId);
      updateCartBadge();
      showToast(`${product.name} added to cart.`);
    });
  });
}

function renderCartItem(item) {
  return `
    <article class="cart-item">
      <div class="cart-row">
        <img class="cart-thumb" src="${item.image}" width="160" height="105" alt="${escapeHtml(item.name)}">
        <div class="cart-info">
          <h3>${escapeHtml(item.name)}</h3>
          <p class="muted">${escapeHtml(item.category)} • ${formatCurrency(item.price)}</p>
          <div class="quantity-controls" aria-label="Quantity controls for ${escapeHtml(item.name)}">
            <button class="icon-button" type="button" data-decrement="${item.id}">−</button>
            <span class="qty-badge">${item.quantity}</span>
            <button class="icon-button" type="button" data-increment="${item.id}">+</button>
            <button class="icon-button danger" type="button" data-remove="${item.id}">Remove</button>
          </div>
        </div>
        <strong>${formatCurrency(item.price * item.quantity)}</strong>
      </div>
    </article>
  `;
}

function bindCartActions() {
  qsa("[data-increment]").forEach((button) => {
    button.addEventListener("click", () => {
      incrementItem(button.dataset.increment);
      updateCartBadge();
      renderCart();
    });
  });

  qsa("[data-decrement]").forEach((button) => {
    button.addEventListener("click", () => {
      decrementItem(button.dataset.decrement);
      updateCartBadge();
      renderCart();
    });
  });

  qsa("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      removeItem(button.dataset.remove);
      updateCartBadge();
      renderCart();
    });
  });

  const clearButton = qs("[data-clear-cart]");
  if (clearButton) {
    clearButton.addEventListener("click", () => {
      clearCart();
      updateCartBadge();
      renderCart();
      showToast("Cart cleared.");
    });
  }

  const checkoutButton = qs("[data-checkout]");
  if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
      showToast("Checkout is a frontend demo endpoint. Cart architecture is complete.");
    });
  }
}

export function updateCartBadge() {
  const badge = qs("[data-cart-count]");
  if (badge) badge.textContent = String(getCartCount());
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");

  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2200);
}
