const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');

function requireAuth(req, res, next) {
  if (!req.session.loggedIn) return res.status(401).json({ error: 'Not logged in' });
  next();
}

router.use(requireAuth);

// GET /api/suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    res.json(suppliers);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/suppliers
router.post('/', async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// PUT /api/suppliers/:id
router.put('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
    res.json(supplier);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// DELETE /api/suppliers/:id
router.delete('/:id', async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;
