const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

function requireAuth(req, res, next) {
  if (!req.session.loggedIn) return res.status(401).json({ error: 'Not logged in' });
  next();
}

// GET /api/settings — public (needed for login page shop name)
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.json(settings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/settings — requires auth
router.post('/', requireAuth, async (req, res) => {
  try {
    const { shopName, address, phone, gstin, defaultMinLevel, currency, newPassword, currentPassword } = req.body;
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    if (shopName !== undefined) settings.shopName = shopName;
    if (address !== undefined) settings.address = address;
    if (phone !== undefined) settings.phone = phone;
    if (gstin !== undefined) settings.gstin = gstin;
    if (defaultMinLevel !== undefined) settings.defaultMinLevel = defaultMinLevel;
    if (currency !== undefined) settings.currency = currency;

    // Password change
    if (newPassword) {
      if (currentPassword !== settings.password) {
        return res.status(400).json({ error: 'Current password is wrong' });
      }
      settings.password = newPassword;
    }

    await settings.save();
    // Update session shop name
    if (shopName) req.session.shopName = shopName;
    res.json(settings);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;
