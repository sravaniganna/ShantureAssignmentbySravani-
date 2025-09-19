
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReportSchema = new Schema({
  reportDate: { type: Date, default: Date.now },
  startDate: Date,
  endDate: Date,
  totalRevenue: Number,
  totalOrders: Number,
  avgOrderValue: Number,
  topProducts: Array,
  regionWise: Array,
  categoryWise: Array,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AnalyticsReport', ReportSchema);
