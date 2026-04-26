const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  itemId:       String,
  itemName:     String,
  category:     String,
  unit:         String,
  currentStock: Number,
  minLevel:     Number,
  qtyOrdered:   Number,
  pricePerUnit: Number,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  poNumber:      { type: String, required: true },
  date:          { type: String, default: '' },
  items:         [orderItemSchema],
  totalEstimate: { type: Number, default: 0 },
  status:        { type: String, default: 'pending' },
}, { timestamps: true });

orderSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.model('Order', orderSchema);
