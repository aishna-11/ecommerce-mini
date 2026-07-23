// Run with: npm run seed
// Wipes the products collection and inserts sample data so the
// storefront has something to show right away.

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const sampleProducts = [
  {
    name: 'Classic Canvas Backpack',
    description: 'A durable everyday backpack with padded laptop sleeve and water-resistant canvas.',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
    category: 'Bags',
    stock: 25,
  },
  {
    name: 'Wireless Over-Ear Headphones',
    description: 'Noise-isolating wireless headphones with 30-hour battery life and deep bass.',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
    category: 'Electronics',
    stock: 40,
  },
  {
    name: 'Minimalist Analog Watch',
    description: 'Stainless steel watch with a clean dial and genuine leather strap.',
    price: 65.0,
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600',
    category: 'Accessories',
    stock: 15,
  },
  {
    name: 'Ceramic Pour-Over Coffee Set',
    description: 'Hand-glazed ceramic dripper and matching mug for a slow morning coffee ritual.',
    price: 34.5,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',
    category: 'Home',
    stock: 30,
  },
  {
    name: 'Running Sneakers',
    description: 'Lightweight breathable sneakers with responsive cushioning for daily runs.',
    price: 74.99,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
    category: 'Footwear',
    stock: 20,
  },
  {
    name: 'Potted Succulent Trio',
    description: 'Three low-maintenance succulents in matching concrete planters.',
    price: 22.0,
    image: 'https://images.unsplash.com/photo-1459156212016-c812468e2115?w=600',
    category: 'Home',
    stock: 50,
  },
  {
    name: 'Notebook & Pen Set',
    description: 'Hardcover dotted notebook paired with a smooth-writing metal pen.',
    price: 18.75,
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600',
    category: 'Stationery',
    stock: 60,
  },
  {
    name: 'Insulated Steel Water Bottle',
    description: 'Keeps drinks cold for 24 hours or hot for 12. 750ml capacity.',
    price: 27.99,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600',
    category: 'Accessories',
    stock: 45,
  },
];

async function seed() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mini_ecommerce';
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB. Seeding products...');

  await Product.deleteMany({});
  await Product.insertMany(sampleProducts);

  console.log(`Inserted ${sampleProducts.length} products.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
