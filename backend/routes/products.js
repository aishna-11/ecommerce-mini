const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

// GET /api/products?category=&search=  -> list all products (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch products.', error: err.message });
  }
});

// GET /api/products/:id -> single product detail
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: 'Invalid product id.' });
  }
});

// POST /api/products -> create a product (simple admin utility, no auth for this mini project)
router.post('/', async (req, res) => {
  try {
    const { name, description, price, image, category, stock } = req.body;
    if (!name || !description || price === undefined) {
      return res.status(400).json({ message: 'name, description and price are required.' });
    }
    const product = await Product.create({ name, description, price, image, category, stock });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Could not create product.', error: err.message });
  }
});

// PUT /api/products/:id -> update a product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Could not update product.', error: err.message });
  }
});

// DELETE /api/products/:id -> remove a product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ message: 'Product deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete product.', error: err.message });
  }
});

module.exports = router;
