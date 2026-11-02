'use strict';
const { Schema, model } = require('mongoose');

const contentSchema = new Schema({
  slug: { type: String, required: true, unique: true }, // about | privacy | terms
  title: String,
  version: { type: String, required: true },
  blocks: [{ _id: false, type: { type: String, enum: ['heading', 'paragraph', 'bullet'] }, text: String }],
}, { timestamps: true });

const faqSchema = new Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const supportTicketSchema = new Schema({
  ticketNumber: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  category: { type: String, required: true },
  message: { type: String, required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
  status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], default: 'OPEN' },
}, { timestamps: true });

const pincodeSchema = new Schema({ pincode: { type: String, required: true, unique: true }, city: String, state: String, district: String });
const ifscSchema = new Schema({ ifsc: { type: String, required: true, unique: true }, bankName: String, branch: String, city: String });

module.exports = {
  Content: model('Content', contentSchema),
  Faq: model('Faq', faqSchema),
  SupportTicket: model('SupportTicket', supportTicketSchema),
  Pincode: model('Pincode', pincodeSchema),
  Ifsc: model('Ifsc', ifscSchema),
};
