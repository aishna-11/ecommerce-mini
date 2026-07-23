const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

// POST /api/orders/checkout  { shippingAddress }
// Turns the user's current cart into an Order, then empties the cart.
// No real payment processing - this is the "basic checkout" the task asks for.
router.post('/checkout', async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    const user = await User.findById(req.userId).populate('cart.product');

    if (!user.cart.length) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    const items = user.cart.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    }));
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      user: user._id,
      items,
      totalAmount,
      shippingAddress,
      status: 'placed',
    });

    // Clear the cart after a successful order
    user.cart = [];
    await user.save();

    res.status(201).json({ message: 'Order placed successfully!', order });
  } catch (err) {
    res.status(500).json({ message: 'Checkout failed.', error: err.message });
  }
});

// GET /api/orders -> order history for the logged-in user
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch orders.', error: err.message });
  }
});

module.exports = router;
