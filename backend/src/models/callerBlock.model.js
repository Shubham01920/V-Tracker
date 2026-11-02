'use strict';
const { Schema, model } = require('mongoose');

const callerBlockSchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  callerHash: { type: String, required: true },
  sourceContactId: { type: Schema.Types.ObjectId, ref: 'ContactEvent' },
}, { timestamps: true });

callerBlockSchema.index({ ownerId: 1, callerHash: 1 }, { unique: true });

module.exports = model('CallerBlock', callerBlockSchema);
