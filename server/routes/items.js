const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

function requireAuth(req, res, next) {
  if (!req.session.loggedIn) return res.status(401).json({ error: 'Not logged in' });
  next();
}

router.use(requireAuth);

// GET /api/items
router.get('/', async (req, res) => {
  try {
    const items = await Item.find().sort({ name: 1 });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/items/low-stock
router.get('/low-stock', async (req, res) => {
  try {
    const items = await Item.find({ stock: { $lt: 4 } });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/items
router.post('/', async (req, res) => {
  try {
    const item = await Item.create(req.body);
    res.status(201).json(item);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// PUT /api/items/:id
router.put('/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// DELETE /api/items/:id
router.delete('/:id', async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;
