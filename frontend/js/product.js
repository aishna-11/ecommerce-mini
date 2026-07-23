const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

function showAlert(message, type = 'success') {
  const box = document.getElementById('alert-box');
  box.textContent = message;
  box.className = `alert alert-${type}`;
  box.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => (box.style.display = 'none'), 3000);
}

async function loadProduct() {
  const container = document.getElementById('product-detail');
  if (!productId) {
    container.innerHTML = `<div class="empty-state">No product selected.</div>`;
    return;
  }

  try {
    const p = await api(`/api/products/${productId}`);
    container.innerHTML = `
      <div class="detail-grid">
        <img src="${p.image}" alt="${p.name}" />
        <div class="detail-info">
          <span class="category">${p.category}</span>
          <h1>${p.name}</h1>
          <div class="price">${formatPrice(p.price)}</div>
          <p class="desc">${p.description}</p>
          <p class="stock-tag">${p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</p>

          <div class="qty-row">
            <div class="qty-control">
              <button id="qty-minus" type="button">−</button>
              <input id="qty-input" type="number" min="1" value="1" />
              <button id="qty-plus" type="button">+</button>
            </div>
            <button id="add-to-cart-btn" class="btn btn-primary" ${p.stock === 0 ? 'disabled' : ''}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('qty-minus').addEventListener('click', () => stepQty(-1));
    document.getElementById('qty-plus').addEventListener('click', () => stepQty(1));
    document.getElementById('add-to-cart-btn').addEventListener('click', () => addToCart(p));
  } catch (err) {
    container.innerHTML = `<div class="empty-state">Could not load this product.<br>${err.message}</div>`;
  }
}

function stepQty(delta) {
  const input = document.getElementById('qty-input');
  const next = Math.max(1, Number(input.value) + delta);
  input.value = next;
}

async function addToCart(product) {
  if (!getToken()) {
    showAlert('Please log in first to add items to your cart.', 'error');
    setTimeout(() => (window.location.href = `login.html?redirect=product.html?id=${product._id}`), 1200);
    return;
  }

  const quantity = Number(document.getElementById('qty-input').value) || 1;
  try {
    await api('/api/cart/add', {
      method: 'POST',
      auth: true,
      body: { productId: product._id, quantity },
    });
    showAlert(`Added ${quantity} × "${product.name}" to your cart.`);
    refreshNavbar();
  } catch (err) {
    showAlert(err.message, 'error');
  }
}

loadProduct();
