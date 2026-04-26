require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const connectDB = require('./db');
const seedIfEmpty = require('./seed');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB().then(() => seedIfEmpty());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'shoporder_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 7 * 24 * 60 * 60,
  }),
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
}));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..')));

// API routes
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/items',     require('./routes/items'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/orders',    require('./routes/orders'));
app.use('/api/settings',  require('./routes/settings'));

// Fallback: serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Local dev
if (require.main === module) {
  app.listen(PORT, () => console.log(`ShopOrder running at http://localhost:${PORT}`));
}

module.exports = app;
