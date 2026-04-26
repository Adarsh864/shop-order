const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// GET /api/auth/setup-status  (public)
router.get('/setup-status', async (req, res) => {
  try {
    const s = await Settings.findOne();
    res.json({ hasAccount: !!(s && s.password) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/signup  (only if no account yet)
router.post('/signup', async (req, res) => {
  try {
    const { shopName, password } = req.body;
    if (!shopName || !shopName.trim()) return res.status(400).json({ error: 'Shop name required' });
    if (!password || password.length < 4)  return res.status(400).json({ error: 'Password must be at least 4 characters' });

    const existing = await Settings.findOne();
    if (existing && existing.password) {
      return res.status(409).json({ error: 'Account already exists' });
    }

    if (existing) {
      existing.shopName = shopName.trim();
      existing.password = password;
      await existing.save();
    } else {
      await Settings.create({ shopName: shopName.trim(), password });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    const settings = await Settings.findOne();
    if (!settings || !settings.password) {
      return res.status(403).json({ error: 'No account. Please sign up first.' });
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
