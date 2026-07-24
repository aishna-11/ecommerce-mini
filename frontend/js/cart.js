function showAlert(message, type = 'error') {
  const box = document.getElementById('alert-box');
  box.textContent = message;
  box.className = `alert alert-${type}`;
  box.style.display = 'block';
  setTimeout(() => (box.style.display = 'none'), 3000);
}

async function loadCart() {
  const content = document.getElementById('cart-content');

  if (!getToken()) {
    content.innerHTML = `
      <div class="cart-page-header">Shopping Cart</div>
      <div class="empty-state">
        Please <a href="login.html">sign in</a> to view your cart.
      </div>`;
    return;
  }

  try {
    const cart = await api('/api/cart', { auth: true });
    renderCart(cart);
  } catch (err) {
    content.innerHTML = `<div class="empty-state">Could not load cart.<br>${err.message}</div>`;
  }
}

function renderCart(cart) {
  const content = document.getElementById('cart-content');

  if (!cart.items.length) {
    content.innerHTML = `
      <div class="cart-page-header">Your ShopZone Cart is empty</div>
      <div class="empty-state">
        <p>You have no items in your cart.</p>
        <a href="index.html" class="btn btn-primary" style="border-radius:4px; display:inline-flex; width:auto; padding:9px 20px;">
          Continue Shopping
        </a>
      </div>`;
    return;
  }

  const totalItems = cart.items.reduce((s, i) => s + i.quantity, 0);

  const itemsHtml = cart.items.map(item => `
    <div class="cart-item" data-id="${item.product._id}">
      <a href="product.html?id=${item.product._id}">
        <img src="${item.product.image}" alt="${item.product.name}" />
      </a>
      <div>
        <a href="product.html?id=${item.product._id}" class="ci-name">${item.product.name}</a>
        <div class="ci-stock">In Stock</div>
        <div class="prime-badge" style="font-size:12px; color:#00a8e1; font-weight:700; margin-bottom:6px;">&#10003; Prime</div>
        <div class="unit-price">${formatPrice(item.product.price)} each</div>
        <div class="ci-actions">
          <div class="qty-control">
            <button type="button" class="qty-minus">−</button>
            <input type="number" min="1" class="qty-input" value="${item.quantity}" />
            <button type="button" class="qty-plus">+</button>
          </div>
          <span style="color:var(--border)">|</span>
          <button class="remove-link">Delete</button>
          <span style="color:var(--border)">|</span>
          <button class="remove-link">Save for later</button>
        </div>
      </div>
      <div class="subtotal">${formatPrice(item.subtotal)}</div>
    </div>
  `).join('');

  content.innerHTML = `
    <div class="cart-page-header">
      Shopping Cart &nbsp;<span style="font-size:14px; font-weight:400; color:var(--muted);">Price</span>
    </div>
    <div class="cart-layout">
      <div class="cart-items-panel">
        ${itemsHtml}
        <div style="text-align:right; padding-top:12px; font-size:16px;">
          Subtotal (${totalItems} item${totalItems !== 1 ? 's' : ''}):
          <strong>${formatPrice(cart.total)}</strong>
        </div>
      </div>

      <div class="summary-card">
        <div style="color:var(--green); font-size:14px; margin-bottom:12px;">
          &#10003; Your order qualifies for FREE Delivery.
        </div>
        <div class="summary-row total">
          <span>Subtotal (${totalItems} item${totalItems !== 1 ? 's' : ''})</span>
          <span>${formatPrice(cart.total)}</span>
        </div>
        <a href="checkout.html" class="btn btn-primary btn-block" style="margin-top:14px; border-radius:4px;">
          Proceed to Checkout
        </a>
      </div>
    </div>
  `;

  document.querySelectorAll('.cart-item').forEach(row => {
    const productId = row.dataset.id;
    const input     = row.querySelector('.qty-input');

    row.querySelector('.qty-minus').addEventListener('click', () => {
      input.value = Math.max(1, Number(input.value) - 1);
      updateQuantity(productId, Number(input.value));
    });
    row.querySelector('.qty-plus').addEventListener('click', () => {
      input.value = Number(input.value) + 1;
      updateQuantity(productId, Number(input.value));
    });
    input.addEventListener('change', () => {
      input.value = Math.max(1, Number(input.value) || 1);
      updateQuantity(productId, Number(input.value));
    });
    row.querySelector('.remove-link').addEventListener('click', () => removeItem(productId));
  });
}

async function updateQuantity(productId, quantity) {
  try {
    const cart = await api('/api/cart/update', { method: 'PUT', auth: true, body: { productId, quantity } });
    renderCart(cart);
    refreshNavbar();
  } catch (err) {
    showAlert(err.message);
  }
}

async function removeItem(productId) {
  try {
    const cart = await api(`/api/cart/remove/${productId}`, { method: 'DELETE', auth: true });
    renderCart(cart);
    refreshNavbar();
  } catch (err) {
    showAlert(err.message);
  }
}

loadCart();
