'use strict';
const { Schema, model } = require('mongoose');

const counterSchema = new Schema({ _id: String, seq: { type: Number, default: 0 } });
const Counter = model('Counter', counterSchema);

/** Atomic sequence, e.g. nextSeq('order') -> 100001, 100002 ... */
async function nextSeq(name, start = 100000) {
  const doc = await Counter.findOneAndUpdate({ _id: name }, { $inc: { seq: 1 } }, { upsert: true, returnDocument: 'after' });
  return start + doc.seq;
}

module.exports = Counter;
module.exports.nextSeq = nextSeq;
