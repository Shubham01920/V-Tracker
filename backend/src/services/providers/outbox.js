'use strict';
/**
 * In-memory record of everything the mock providers "sent" (SMS, e-mail, push, calls, payouts).
 * Used by tests and by developers to see what would have gone out. Capped to the last 200 items each.
 */
const boxes = { sms: [], email: [], push: [], calls: [], payouts: [], shipments: [], fastag: [] };

function push(box, item) {
  boxes[box].push({ ...item, at: new Date().toISOString() });
  if (boxes[box].length > 200) boxes[box].shift();
}

const last = (box, pred = () => true) => [...boxes[box]].reverse().find(pred);
const clear = () => Object.keys(boxes).forEach((k) => { boxes[k].length = 0; });

module.exports = { boxes, push, last, clear };
