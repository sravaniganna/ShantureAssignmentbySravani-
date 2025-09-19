
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { stringify } = require('querystring');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 4000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shanture_db';

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error', err));

// Models
const Order = require('./models/Order');
const AnalyticsReport = require('./models/AnalyticsReport');

// HTTP + Socket.IO setup
const server = http.createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('Socket connected', socket.id);
  socket.on('disconnect', () => console.log('Socket disconnected', socket.id));
});

// Routes
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Date-range aggregate endpoint: calculates and saves report, emits socket event
app.post('/api/reports/date-range', async (req, res) => {
  try {
    const { startDate, endDate, save } = req.body;
    if (!startDate || !endDate) return res.status(400).json({ error: 'startDate and endDate required' });
    const s = new Date(startDate);
    const e = new Date(endDate);
    e.setHours(23,59,59,999);

    // total revenue & total orders
    const totals = await Order.aggregate([
      { $match: { createdAt: { $gte: s, $lte: e } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' }, totalOrders: { $sum: 1 }, avgOrderValue: { $avg: '$total' } } }
    ]);

    // top products
    const topProducts = await Order.aggregate([
      { $match: { createdAt: { $gte: s, $lte: e } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.productId', name: { $first: '$items.name' }, qty: { $sum: '$items.qty' } } },
      { $sort: { qty: -1 } },
      { $limit: 5 }
    ]);

    // region wise revenue
    const regionWise = await Order.aggregate([
      { $match: { createdAt: { $gte: s, $lte: e } } },
      { $group: { _id: '$region', revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { revenue: -1 } }
    ]);

    // category wise revenue (by items.category)
    const categoryWise = await Order.aggregate([
      { $match: { createdAt: { $gte: s, $lte: e } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.category', revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } } } },
      { $sort: { revenue: -1 } }
    ]);

    const report = {
      reportDate: new Date(),
      startDate: s,
      endDate: e,
      totalRevenue: totals[0]?.totalRevenue || 0,
      totalOrders: totals[0]?.totalOrders || 0,
      avgOrderValue: totals[0]?.avgOrderValue || 0,
      topProducts,
      regionWise,
      categoryWise
    };

    // Save report if requested (or always save to history)
    const saved = await AnalyticsReport.create(report);

    // Emit socket event to notify clients
    io.emit('reportGenerated', { id: saved._id, startDate: saved.startDate, endDate: saved.endDate, totalRevenue: saved.totalRevenue });

    res.json({ report, savedId: saved._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// List saved reports (history)
app.get('/api/reports/history', async (req, res) => {
  try {
    const list = await AnalyticsReport.find().sort({ createdAt: -1 }).limit(50).lean();
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Export a specific saved report as CSV
app.get('/api/reports/:id/export', async (req, res) => {
  try {
    const id = req.params.id;
    const report = await AnalyticsReport.findById(id).lean();
    if (!report) return res.status(404).send('Report not found');

    // Simple CSV: rows for regionWise and categoryWise, plus summary
    let csv = 'type,key,value\n';
    csv += `summary,totalRevenue,${report.totalRevenue}\n`;
    csv += `summary,totalOrders,${report.totalOrders}\n`;
    csv += `summary,avgOrderValue,${report.avgOrderValue}\n`;

    csv += '\nregion,region,revenue\n';
    report.regionWise.forEach(r => {
      csv += `region,${r._id},${r.revenue}\n`;
    });

    csv += '\ncategory,category,revenue\n';
    report.categoryWise.forEach(c => {
      csv += `category,${c._id},${c.revenue}\n`;
    });

    res.setHeader('Content-disposition', 'attachment; filename=report_' + id + '.csv');
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).send('server error');
  }
});

// Start server
server.listen(port, () => console.log('Server listening on', port));
