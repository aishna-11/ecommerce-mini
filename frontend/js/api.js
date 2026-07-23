// Small fetch wrapper shared by every page.
// Because server.js serves this frontend folder itself, relative paths
// like /api/products work automatically. If you run the frontend on a
// different port/host, change BASE_URL below.
const BASE_URL = '';

function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

function saveSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

async function api(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(BASE_URL + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong.');
  }
  return data;
}

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`;
}

function getCartCountBadge() {
  return document.getElementById('cart-count');
}

// Updates the shared navbar: shows Login/Register or the user's name + Logout,
// and refreshes the cart item count badge. Called on every page.
async function refreshNavbar() {
  const authArea = document.getElementById('auth-area');
  if (!authArea) return;

  const user = getUser();
  if (user) {
    authArea.innerHTML = `
      <span class="nav-username">Hi, ${user.name}</span>
      <button id="logout-btn" class="btn btn-ghost">Logout</button>
    `;
    document.getElementById('logout-btn').addEventListener('click', () => {
      clearSession();
      window.location.href = 'login.html';
    });

    try {
      const cart = await api('/api/cart', { auth: true });
      const badge = getCartCountBadge();
      if (badge) {
        const count = cart.items.reduce((sum, i) => sum + i.quantity, 0);
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-flex' : 'none';
      }
    } catch (e) {
      // token might be expired - ignore quietly here, pages that need
      // auth will redirect on their own
    }
  } else {
    authArea.innerHTML = `
      <a href="login.html" class="btn btn-ghost">Login</a>
      <a href="register.html" class="btn btn-primary">Register</a>
    `;
  }
}

document.addEventListener('DOMContentLoaded', refreshNavbar);
