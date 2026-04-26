const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Item = require('../models/Item');

function requireAuth(req, res, next) {
  if (!req.session.loggedIn) return res.status(401).json({ error: 'Not logged in' });
  next();
}

router.use(requireAuth);

// GET /api/orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/orders
router.post('/', async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// PUT /api/orders/:id/status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Guard: prevent double stock increment
    if (status === 'received' && order.status === 'received') {
      return res.status(400).json({ error: 'Order already marked as received' });
    }

    order.status = status;
    await order.save();

    if (status === 'received') {
      for (const oi of order.items) {
        if (oi.itemId) {
          await Item.findByIdAndUpdate(oi.itemId, { $inc: { stock: oi.qtyOrdered || 0 } });
        }
      }
    }

    res.json(order);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// DELETE /api/orders/:id
router.delete('/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;
