const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  shopName:        { type: String, default: '' },
  address:         { type: String, default: '' },
  phone:           { type: String, default: '' },
  gstin:           { type: String, default: '' },
  defaultMinLevel: { type: Number, default: 4 },
  currency:        { type: String, default: '₹' },
  password:        { type: String, default: '' },
});

settingsSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password; // never expose password to frontend
  },
});

module.exports = mongoose.model('Settings', settingsSchema);
