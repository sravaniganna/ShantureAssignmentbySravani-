
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  productId: String,
  name: String,
  category: String,
  price: Number,
  qty: Number
}, { _id: false });

const OrderSchema = new Schema({
  orderId: String,
  customerName: String,
  region: String,
  total: Number,
  items: [ItemSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
