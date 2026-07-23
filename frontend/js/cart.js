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
    content.innerHTML = `<div class="empty-state">Please <a href="login.html">log in</a> to view your cart.</div>`;
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
    content.innerHTML = `<div class="empty-state">Your cart is empty. <a href="index.html">Continue shopping →</a></div>`;
    return;
  }

  const itemsHtml = cart.items
    .map(
      (item) => `
    <div class="cart-item" data-id="${item.product._id}">
      <img src="${item.product.image}" alt="${item.product.name}" />
      <div>
        <div class="name">${item.product.name}</div>
        <div class="unit-price">${formatPrice(item.product.price)} each</div>
      </div>
      <div class="qty-control">
        <button type="button" class="qty-minus">−</button>
        <input type="number" min="1" class="qty-input" value="${item.quantity}" />
        <button type="button" class="qty-plus">+</button>
      </div>
      <div style="text-align:right">
        <div class="subtotal">${formatPrice(item.subtotal)}</div>
        <button class="remove-link">Remove</button>
      </div>
    </div>
  `
    )
    .join('');

  content.innerHTML = `
    <div class="cart-layout">
      <div>${itemsHtml}</div>
      <div class="summary-card">
        <h3>Order Summary</h3>
        <div class="summary-row"><span>Items</span><span>${cart.items.reduce((s, i) => s + i.quantity, 0)}</span></div>
        <div class="summary-row total"><span>Total</span><span>${formatPrice(cart.total)}</span></div>
        <a href="checkout.html" class="btn btn-primary btn-block" style="margin-top:16px;">Proceed to Checkout</a>
      </div>
    </div>
  `;

  document.querySelectorAll('.cart-item').forEach((row) => {
    const productId = row.dataset.id;
    const input = row.querySelector('.qty-input');

    row.querySelector('.qty-minus').addEventListener('click', () => {
      input.value = Math.max(1, Number(input.value) - 1);
      updateQuantity(productId, Number(input.value));
    });
    row.querySelector('.qty-plus').addEventListener('click', () => {
      input.value = Number(input.value) + 1;
      updateQuantity(productId, Number(input.value));
    });
    input.addEventListener('change', () => {
      const v = Math.max(1, Number(input.value) || 1);
      input.value = v;
      updateQuantity(productId, v);
    });
    row.querySelector('.remove-link').addEventListener('click', () => removeItem(productId));
  });
}

async function updateQuantity(productId, quantity) {
  try {
    const cart = await api('/api/cart/update', {
      method: 'PUT',
      auth: true,
      body: { productId, quantity },
    });
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
