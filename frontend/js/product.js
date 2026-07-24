const params    = new URLSearchParams(window.location.search);
const productId = params.get('id');

function showAlert(message, type = 'success') {
  const box = document.getElementById('alert-box');
  box.textContent = message;
  box.className = `alert alert-${type}`;
  box.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => (box.style.display = 'none'), 3000);
}

function pseudoRating(id) {
  const n = parseInt(id.slice(-4), 16) % 25;
  const rating = 3.0 + (n / 25) * 2.0;
  const count  = 50 + (parseInt(id.slice(-2), 16) * 13) % 1200;
  return { rating: rating.toFixed(1), count };
}

function starsHtml(rating) {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.4 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

async function loadProduct() {
  const container = document.getElementById('product-detail');
  if (!productId) {
    container.innerHTML = `<div class="empty-state">No product selected.</div>`;
    return;
  }

  try {
    const p = await api(`/api/products/${productId}`);
    const { rating, count } = pseudoRating(p._id);
    const inStock = p.stock > 0;
    const dollars = Math.floor(p.price);
    const cents   = (p.price % 1).toFixed(2).slice(1);

    // Set breadcrumb
    const bc = document.getElementById('breadcrumb-cat');
    if (bc) bc.textContent = p.category;

    container.innerHTML = `
      <div class="detail-wrap">
        <!-- Image column -->
        <div class="detail-img-col">
          <img src="${p.image}" alt="${p.name}" />
        </div>

        <!-- Info column -->
        <div class="detail-info">
          <div class="d-category">${p.category}</div>
          <h1>${p.name}</h1>

          <div class="d-rating">
            <span class="star-row" style="color:var(--amz-orange); font-size:16px;">${starsHtml(parseFloat(rating))}</span>
            <a href="#">${rating} (${count.toLocaleString()} ratings)</a>
          </div>

          <hr />

          <div class="d-price"><sup>$</sup>${dollars}<sup>${cents}</sup></div>
          <div class="d-prime">&#10003; Prime &nbsp; FREE delivery</div>

          <hr />

          <p class="d-desc">${p.description}</p>

          <ul style="font-size:14px; color:var(--muted); padding-left:18px; line-height:1.9; margin:0 0 14px;">
            <li>Category: <strong style="color:var(--text)">${p.category}</strong></li>
            <li>Ships from: <strong style="color:var(--text)">ShopZone</strong></li>
            <li>Sold by: <strong style="color:var(--text)">ShopZone</strong></li>
          </ul>
        </div>

        <!-- Buy box -->
        <div class="buy-box">
          <div class="bb-price"><sup style="font-size:14px;">$</sup>${dollars}<sup style="font-size:14px;">${cents}</sup></div>
          <div class="bb-delivery">FREE delivery <b style="color:var(--amz-link);">tomorrow</b></div>
          <div class="bb-stock ${inStock ? '' : 'out'}">${inStock ? 'In Stock' : 'Out of Stock'}</div>

          <div class="qty-row">
            <label style="font-size:13px; white-space:nowrap;">Qty:</label>
            <div class="qty-control">
              <button id="qty-minus" type="button">−</button>
              <input id="qty-input" type="number" min="1" value="1" />
              <button id="qty-plus" type="button">+</button>
            </div>
          </div>

          <button id="add-to-cart-btn" class="btn btn-primary btn-block" ${!inStock ? 'disabled' : ''}>
            Add to Cart
          </button>
          <button id="buy-now-btn" class="btn btn-buynow btn-block" ${!inStock ? 'disabled' : ''}>
            Buy Now
          </button>

          <hr style="border:none; border-top:1px solid var(--border); margin:8px 0;" />
          <div style="font-size:12px; color:var(--muted); line-height:1.7;">
            <div>Ships from: <span style="color:var(--amz-link)">ShopZone</span></div>
            <div>Sold by: <span style="color:var(--amz-link)">ShopZone</span></div>
            <div>Returns: <span style="color:var(--amz-link)">30-day return policy</span></div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('qty-minus').addEventListener('click', () => stepQty(-1));
    document.getElementById('qty-plus').addEventListener('click',  () => stepQty(1));
    document.getElementById('add-to-cart-btn').addEventListener('click', () => addToCart(p));
    document.getElementById('buy-now-btn').addEventListener('click', async () => {
      await addToCart(p);
      window.location.href = 'checkout.html';
    });
  } catch (err) {
    container.innerHTML = `<div class="empty-state">Could not load this product.<br>${err.message}</div>`;
  }
}

function stepQty(delta) {
  const input = document.getElementById('qty-input');
  input.value = Math.max(1, Number(input.value) + delta);
}

async function addToCart(product) {
  if (!getToken()) {
    showAlert('Please sign in first to add items to your cart.', 'error');
    setTimeout(() => (window.location.href = `login.html?redirect=product.html?id=${product._id}`), 1400);
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
