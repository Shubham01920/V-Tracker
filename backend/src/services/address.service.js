'use strict';
const { Address } = require('../models');
const business = require('../config/business');
const ApiError = require('../utils/ApiError');

const present = (a) => ({
  id: String(a._id), name: a.name, phone: a.phone, label: a.label, line1: a.line1, line2: a.line2 || '',
  pincode: a.pincode, city: a.city, state: a.state, isDefault: a.isDefault, updatedAt: a.updatedAt,
});

async function list(userId) {
  const items = await Address.find({ userId }).sort({ isDefault: -1, createdAt: 1 });
  return items.map(present);
}

async function create(userId, body) {
  const count = await Address.countDocuments({ userId });
  if (count >= business.maxAddressesPerUser) throw new ApiError('LIMIT_REACHED', `You can save up to ${business.maxAddressesPerUser} addresses`);
  const makeDefault = body.isDefault || count === 0;
  if (makeDefault) await Address.updateMany({ userId, isDefault: true }, { isDefault: false });
  const a = await Address.create({ ...body, userId, isDefault: makeDefault });
  return present(a);
}

async function update(userId, id, body) {
  const a = await Address.findOne({ _id: id, userId });
  if (!a) throw ApiError.notFound('Address');
  if (body.isDefault === true) await Address.updateMany({ userId, isDefault: true, _id: { $ne: a._id } }, { isDefault: false });
  if (body.isDefault === false && a.isDefault) delete body.isDefault; // there must always be one default
  Object.assign(a, body);
  await a.save();
  return present(a);
}

async function remove(userId, id) {
  const a = await Address.findOneAndDelete({ _id: id, userId });
  if (!a) throw ApiError.notFound('Address');
  // orders keep their own address snapshot, so deleting is always safe
  if (a.isDefault) {
    const next = await Address.findOne({ userId }).sort({ createdAt: 1 });
    if (next) await Address.updateOne({ _id: next._id }, { isDefault: true });
  }
}

module.exports = { list, create, update, remove, present };
