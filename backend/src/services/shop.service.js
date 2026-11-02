'use strict';
/** Catalogue, wishlist and cart (SHP, WSH, CRT). The server re-prices every cart line on each read (PDF §4.6.3). */
const { Product, Wishlist, Cart } = require('../models');
const business = require('../config/business');
const ApiError = require('../utils/ApiError');
const { paginate, pageMeta, escapeRegex } = require('../utils/helpers');
const env = require('../config/env');

const abs = (u) => (u && u.startsWith('/') ? `${env.PUBLIC_BASE_URL}${u}` : u || null);

function presentProduct(p, wishlisted) {
  const out = {
    id: String(p._id), slug: p.slug, title: p.title, subtitle: p.subtitle, category: p.category,
    pricePaise: p.pricePaise, mrpPaise: p.mrpPaise || null, taxRatePercent: p.taxRatePercent, currency: business.currency,
    priceNote: `Excl. ${p.taxRatePercent}% GST`, rating: p.rating, ratingCount: p.ratingCount, imageUrl: abs(p.imageUrl),
    inStock: p.stock > 0, stock: p.stock,
  };
  if (wishlisted !== undefined) out.wishlisted = wishlisted;
  return out;
}

async function listProducts(user, { category, q, ...query }) {
  const p = paginate(query);
  const filter = { isActive: true };
  if (category && category !== 'ALL') filter.category = category;
  if (q) {
    const rx = new RegExp(escapeRegex(q.trim()), 'i');
    filter.$or = [{ title: rx }, { subtitle: rx }, { description: rx }];
  }
  const [items, total] = await Promise.all([
    Product.find(filter).sort({ sortOrder: 1, createdAt: 1 }).skip(p.skip).limit(p.limit),
    Product.countDocuments(filter),
  ]);
  let wished = new Set();
  if (user) wished = new Set((await Wishlist.find({ userId: user._id, productId: { $in: items.map((i) => i._id) } })).map((w) => String(w.productId)));
  return { items: items.map((i) => presentProduct(i, user ? wished.has(String(i._id)) : undefined)), meta: pageMeta(p, total) };
}

async function getProduct(user, id) {
  const p = await Product.findOne({ _id: id, isActive: true });
  if (!p) throw ApiError.notFound('Product');
  const wishlisted = user ? !!(await Wishlist.exists({ userId: user._id, productId: p._id })) : false;
  return { ...presentProduct(p, wishlisted), description: p.description, gallery: (p.gallery.length ? p.gallery : [p.imageUrl].filter(Boolean)).map(abs), features: p.features, labelsIncluded: p.labelsIncluded };
}

async function addWishlist(user, productId) {
  if (!(await Product.exists({ _id: productId, isActive: true }))) throw ApiError.notFound('Product');
  await Wishlist.updateOne({ userId: user._id, productId }, { $setOnInsert: { userId: user._id, productId } }, { upsert: true });
}

async function removeWishlist(user, productId) {
  await Wishlist.deleteOne({ userId: user._id, productId });
}

// ---------------------------------------------------------------- cart
async function loadCart(userId) {
  return Cart.findOneAndUpdate({ userId }, { $setOnInsert: { userId, items: [] } }, { upsert: true, returnDocument: 'after' });
}

/** Re-price from the catalogue; silently drop products that were removed. */
async function priceCart(cart) {
  const products = await Product.find({ _id: { $in: cart.items.map((i) => i.productId) } });
  const map = new Map(products.map((p) => [String(p._id), p]));
  const lines = [];
  for (const i of cart.items) {
    const p = map.get(String(i.productId));
    if (!p || !p.isActive) continue;
    lines.push({
      productId: String(p._id), title: p.title, subtitle: p.subtitle, category: p.category, imageUrl: abs(p.imageUrl),
      unitPricePaise: p.pricePaise, qty: i.qty, lineTotalPaise: p.pricePaise * i.qty, taxRatePercent: p.taxRatePercent,
      inStock: p.stock >= i.qty, labelsIncluded: p.labelsIncluded, labelVehicleType: p.labelVehicleType, _product: p,
    });
  }
  return lines;
}

function presentCart(lines) {
  const items = lines.map(({ _product, labelsIncluded, labelVehicleType, ...rest }) => rest);
  return {
    items,
    totalItems: items.reduce((s, l) => s + l.qty, 0),
    subtotalPaise: items.reduce((s, l) => s + l.lineTotalPaise, 0),
    currency: business.currency,
  };
}

async function getCart(user) {
  const cart = await loadCart(user._id);
  return presentCart(await priceCart(cart));
}

async function setItem(user, productId, qty) {
  if (qty > business.cartMaxQtyPerLine) throw new ApiError('QTY_LIMIT', `You can add at most ${business.cartMaxQtyPerLine} of one item`);
  const p = await Product.findOne({ _id: productId, isActive: true });
  if (!p) throw ApiError.notFound('Product');
  if (p.stock < qty) throw new ApiError('OUT_OF_STOCK', p.stock > 0 ? `Only ${p.stock} left in stock` : 'This item is out of stock', [{ field: 'qty', issue: 'stock', available: p.stock }]);
  const cart = await loadCart(user._id);
  const line = cart.items.find((i) => String(i.productId) === String(p._id));
  if (line) line.qty = qty;
  else cart.items.push({ productId: p._id, qty });
  await cart.save();
  return presentCart(await priceCart(cart));
}

async function removeItem(user, productId) {
  const cart = await loadCart(user._id);
  cart.items = cart.items.filter((i) => String(i.productId) !== String(productId));
  await cart.save();
  return presentCart(await priceCart(cart));
}

async function clearCart(userId) {
  await Cart.updateOne({ userId }, { items: [] });
}

module.exports = { listProducts, getProduct, addWishlist, removeWishlist, getCart, setItem, removeItem, clearCart, loadCart, priceCart, presentProduct };
