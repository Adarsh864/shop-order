const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  phone:    { type: String, default: '' },
  address:  { type: String, default: '' },
  category: { type: String, default: '' },
}, { timestamps: true });

supplierSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.model('Supplier', supplierSchema);
