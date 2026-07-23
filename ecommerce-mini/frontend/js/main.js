let allProducts = [];

async function loadProducts() {
  const grid = document.getElementById('product-grid');
  try {
    allProducts = await api('/api/products');
    populateCategoryFilter(allProducts);
    renderProducts(allProducts);
  } catch (err) {
    grid.innerHTML = `<div class="empty-state">Could not load products. Is the backend server running?<br>${err.message}</div>`;
  }
}

function populateCategoryFilter(products) {
  const select = document.getElementById('category-select');
  const categories = [...new Set(products.map((p) => p.category))].sort();
  categories.forEach((cat) => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

function renderProducts(products) {
  const grid = document.getElementById('product-grid');

  if (!products.length) {
    grid.innerHTML = `<div class="empty-state">No products match your search.</div>`;
    return;
  }

  grid.innerHTML = products
    .map(
      (p) => `
    <a class="card" href="product.html?id=${p._id}">
      <img class="thumb" src="${p.image}" alt="${p.name}" />
      <div class="card-body">
        <span class="category">${p.category}</span>
        <h3>${p.name}</h3>
        <span class="stock-tag">${p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</span>
        <span class="price">${formatPrice(p.price)}</span>
      </div>
    </a>
  `
    )
    .join('');
}

function applyFilters() {
  const search = document.getElementById('search-input').value.toLowerCase();
  const category = document.getElementById('category-select').value;

  const filtered = allProducts.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search);
    const matchesCategory = !category || p.category === category;
    return matchesSearch && matchesCategory;
  });

  renderProducts(filtered);
}

document.getElementById('search-input').addEventListener('input', applyFilters);
document.getElementById('category-select').addEventListener('change', applyFilters);

loadProducts();
