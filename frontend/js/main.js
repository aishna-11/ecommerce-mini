let allProducts = [];

async function loadProducts() {
  const grid = document.getElementById('product-grid');
  try {
    allProducts = await api('/api/products');
    populateCategoryFilter(allProducts);

    // Support ?cat= and ?q= URL params from category nav / hero search
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('cat');
    const qParam   = params.get('q');
    if (catParam) {
      document.getElementById('category-select').value = catParam;
    }
    if (qParam) {
      document.getElementById('search-input').value = qParam;
    }
    applyFilters();
  } catch (err) {
    grid.innerHTML = `<div class="empty-state">Could not load products. Is the backend server running?<br>${err.message}</div>`;
  }
}

function populateCategoryFilter(products) {
  const select = document.getElementById('category-select');
  const categories = [...new Set(products.map(p => p.category))].sort();
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

// Simple deterministic pseudo-rating based on product id
function pseudoRating(id) {
  const n = parseInt(id.slice(-4), 16) % 25;
  const rating = 3.0 + (n / 25) * 2.0;          // 3.0 – 5.0
  const count  = 50 + (parseInt(id.slice(-2), 16) * 13) % 1200;
  return { rating: rating.toFixed(1), count };
}

function starsHtml(rating) {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.4 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

function renderProducts(products) {
  const grid = document.getElementById('product-grid');
  if (!products.length) {
    grid.innerHTML = `<div class="empty-state">No products match your search. <a href="index.html">Clear filters</a></div>`;
    return;
  }

  grid.innerHTML = products.map(p => {
    const { rating, count } = pseudoRating(p._id);
    const inStock = p.stock > 0;
    const dollars = Math.floor(p.price);
    const cents   = (p.price % 1).toFixed(2).slice(1); // ".99"

    return `
    <a class="card" href="product.html?id=${p._id}">
      <img class="thumb" src="${p.image}" alt="${p.name}" loading="lazy" />
      <div class="card-body">
        <span class="p-category">${p.category}</span>
        <h3>${p.name}</h3>
        <div class="stars">
          <span class="star-row" title="${rating} out of 5">${starsHtml(parseFloat(rating))}</span>
          <span class="rating-count">${count.toLocaleString()}</span>
        </div>
        <div class="price-row">
          <span class="price-main"><sup>$</sup>${dollars}<sup>${cents}</sup></span>
        </div>
        <div class="prime-badge">&#10003; Prime</div>
        <div class="delivery">FREE delivery <b>tomorrow</b></div>
        <div class="stock-tag ${inStock ? '' : 'stock-out'}">${inStock ? 'In Stock' : 'Out of Stock'}</div>
      </div>
    </a>`;
  }).join('');
}

function applyFilters() {
  const search   = document.getElementById('search-input').value.toLowerCase();
  const category = document.getElementById('category-select').value;
  const filtered = allProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search) || p.category.toLowerCase().includes(search);
    const matchCat    = !category || p.category === category;
    return matchSearch && matchCat;
  });
  document.querySelector('.section-title h2').textContent =
    `${filtered.length} result${filtered.length !== 1 ? 's' : ''} ${category ? `in "${category}"` : ''}`;
  renderProducts(filtered);
}

document.getElementById('search-input').addEventListener('input', applyFilters);
document.getElementById('category-select').addEventListener('change', applyFilters);

loadProducts();
