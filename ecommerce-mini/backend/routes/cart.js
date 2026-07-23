const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// All cart routes require the user to be logged in
router.use(requireAuth);

// Helper: load the user's cart with product details populated, and compute total
async function getPopulatedCart(userId) {
  const user = await User.findById(userId).populate('cart.product');
  const items = user.cart
    .filter((item) => item.product) // guard against deleted products
    .map((item) => ({
      product: item.product,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
    }));
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  return { items, total };
}

// GET /api/cart -> current user's cart
router.get('/', async (req, res) => {
  try {
    const cart = await getPopulatedCart(req.userId);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch cart.', error: err.message });
  }
});

// POST /api/cart/add  { productId, quantity }
router.post('/add', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    const user = await User.findById(req.userId);
    const existingItem = user.cart.find((item) => item.product.toString() === productId);

    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      user.cart.push({ product: productId, quantity: Number(quantity) });
    }

    await user.save();
    const cart = await getPopulatedCart(req.userId);
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Could not add item to cart.', error: err.message });
  }
});

// PUT /api/cart/update  { productId, quantity }
router.put('/update', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1.' });
    }

    const user = await User.findById(req.userId);
    const item = user.cart.find((item) => item.product.toString() === productId);
    if (!item) return res.status(404).json({ message: 'Item not in cart.' });

    item.quantity = Number(quantity);
    await user.save();

    const cart = await getPopulatedCart(req.userId);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Could not update cart.', error: err.message });
  }
});

// DELETE /api/cart/remove/:productId
router.delete('/remove/:productId', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.cart = user.cart.filter((item) => item.product.toString() !== req.params.productId);
    await user.save();

    const cart = await getPopulatedCart(req.userId);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Could not remove item.', error: err.message });
  }
});

module.exports = router;
