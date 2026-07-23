function showAuthError(message) {
  const box = document.getElementById('alert-box');
  box.textContent = message;
  box.style.display = 'block';
}

// Redirect already-logged-in users straight to the shop
if (getToken() && (document.getElementById('login-form') || document.getElementById('register-form'))) {
  window.location.href = 'index.html';
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      const data = await api('/api/auth/login', { method: 'POST', body: { email, password } });
      saveSession(data.token, data.user);

      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      window.location.href = redirect || 'index.html';
    } catch (err) {
      showAuthError(err.message);
    }
  });
}

const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      const data = await api('/api/auth/register', { method: 'POST', body: { name, email, password } });
      saveSession(data.token, data.user);
      window.location.href = 'index.html';
    } catch (err) {
      showAuthError(err.message);
    }
  });
}
