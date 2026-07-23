function showAlert(message, type = 'error') {
  const box = document.getElementById('alert-box');
  box.textContent = message;
  box.className = `alert alert-${type}`;
  box.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function loadCheckout() {
  const content = document.getElementById('checkout-content');

  if (!getToken()) {
    content.innerHTML = `<div class="empty-state">Please <a href="login.html?redirect=checkout.html">log in</a> to check out.</div>`;
    return;
  }

  try {
    const cart = await api('/api/cart', { auth: true });

    if (!cart.items.length) {
      content.innerHTML = `<div class="empty-state">Your cart is empty. <a href="index.html">Continue shopping →</a></div>`;
      return;
    }

    const linesHtml = cart.items
      .map(
        (item) => `
      <div class="order-line">
        <span>${item.product.name} × ${item.quantity}</span>
        <span>${formatPrice(item.subtotal)}</span>
      </div>
    `
      )
      .join('');

    content.innerHTML = `
      <div class="checkout-layout">
        <div class="form-card" style="margin:0;">
          <h1 style="margin-top:0;">Shipping details</h1>
          <p class="subtitle">No payment required for this demo checkout — just confirm where the order "ships" to.</p>
          <form id="checkout-form">
            <div class="field">
              <label for="fullName">Full name</label>
              <input type="text" id="fullName" required />
            </div>
            <div class="field">
              <label for="street">Street address</label>
              <input type="text" id="street" required />
            </div>
            <div class="field">
              <label for="city">City</label>
              <input type="text" id="city" required />
            </div>
            <div class="field">
              <label for="postalCode">Postal code</label>
              <input type="text" id="postalCode" required />
            </div>
            <div class="field">
              <label for="country">Country</label>
              <input type="text" id="country" required />
            </div>
            <button type="submit" class="btn btn-primary btn-block">Place Order</button>
          </form>
        </div>

        <div class="summary-card">
          <h3>Order Summary</h3>
          ${linesHtml}
          <div class="summary-row total"><span>Total</span><span>${formatPrice(cart.total)}</span></div>
        </div>
      </div>
    `;

    document.getElementById('checkout-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const shippingAddress = {
        fullName: document.getElementById('fullName').value.trim(),
        street: document.getElementById('street').value.trim(),
        city: document.getElementById('city').value.trim(),
        postalCode: document.getElementById('postalCode').value.trim(),
        country: document.getElementById('country').value.trim(),
      };

      const submitBtn = e.target.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Placing order...';

      try {
        const result = await api('/api/orders/checkout', {
          method: 'POST',
          auth: true,
          body: { shippingAddress },
        });
        showOrderConfirmation(result.order);
        refreshNavbar();
      } catch (err) {
        showAlert(err.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Place Order';
      }
    });
  } catch (err) {
    content.innerHTML = `<div class="empty-state">Could not load checkout.<br>${err.message}</div>`;
  }
}

function showOrderConfirmation(order) {
  const content = document.getElementById('checkout-content');
  content.innerHTML = `
    <div class="form-card" style="text-align:center;">
      <h1>🎉 Order placed!</h1>
      <p class="subtitle">Order #${order._id.slice(-8).toUpperCase()} — total ${formatPrice(order.totalAmount)}</p>
      <p style="color:var(--muted); font-size:14px;">This is a demo checkout, so no payment was collected. A confirmation record was saved to your order history.</p>
      <a href="index.html" class="btn btn-primary btn-block" style="margin-top:10px;">Continue Shopping</a>
    </div>
  `;
}

loadCheckout();
