const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  category:     { type: String, default: '' },
  stock:        { type: Number, default: 0 },
  minLevel:     { type: Number, default: 10 },
  unit:         { type: String, default: '' },
  pricePerUnit: { type: Number, default: 0 },
  supplierId:   { type: String, default: '' },
}, { timestamps: true });

itemSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.model('Item', itemSchema);
