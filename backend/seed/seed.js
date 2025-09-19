
const mongoose = require('mongoose');
const Order = require('../models/Order');
require('dotenv').config();
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shanture_db';
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> seed())
  .catch(err => console.error(err));

const regions = ['North', 'South', 'East', 'West'];
const products = [
  { id: 'p1', name: 'Smartphone', category: 'Electronics', price: 300 },
  { id: 'p2', name: 'T-Shirt', category: 'Clothing', price: 20 },
  { id: 'p3', name: 'Blender', category: 'Home', price: 60 },
  { id: 'p4', name: 'Novel', category: 'Books', price: 12 },
  { id: 'p5', name: 'Headphones', category: 'Electronics', price: 80 }
];

async function seed(){
  console.log('Seeding sample orders...');
  await Order.deleteMany({});
  const now = new Date();
  const start = new Date(now.getFullYear()-2, 0, 1);
  const orders = [];
  for(let i=0;i<800;i++){
    const days = Math.floor(Math.random() * ( (now - start) / (1000*60*60*24) ));
    const createdAt = new Date(start.getTime() + days * 24*60*60*1000);
    const numItems = Math.floor(Math.random()*3)+1;
    const items = [];
    let total = 0;
    for(let j=0;j<numItems;j++){
      const p = products[Math.floor(Math.random()*products.length)];
      const qty = Math.floor(Math.random()*3)+1;
      items.push({ productId: p.id, name: p.name, category: p.category, price: p.price, qty });
      total += p.price * qty;
    }
    orders.push({
      orderId: 'ORD'+(1000+i),
      customerName: 'Customer'+i,
      region: regions[Math.floor(Math.random()*regions.length)],
      total,
      items,
      createdAt
    });
  }
  await Order.insertMany(orders);
  console.log('Inserted', orders.length, 'orders');
  process.exit(0);
}
