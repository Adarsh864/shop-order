const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    let settings = await Settings.findOne();
    if (!settings) {
      // First ever login — create settings with whatever password they use
      settings = await Settings.create({ password, shopName: '' });
    }
    if (password !== settings.password) {
      return res.status(401).json({ error: 'Wrong password' });
    }
    req.session.loggedIn = true;
    req.session.shopName = settings.shopName;
    res.json({ loggedIn: true, shopName: settings.shopName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

// GET /api/auth/session
router.get('/session', (req, res) => {
  if (req.session.loggedIn) {
    res.json({ loggedIn: true, shopName: req.session.shopName });
  } else {
    res.status(401).json({ loggedIn: false });
  }
});

module.exports = router;
