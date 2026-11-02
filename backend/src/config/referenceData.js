'use strict';
/**
 * Reference data the app needs to work (catalogue, issuers, coupons, legal text, FAQs, lookups).
 * Loaded automatically on start-up when missing (BOOTSTRAP_ON_START=true) and by `npm run seed`.
 * Existing rows are never overwritten, so edits made in the database survive restarts.
 */
const img = (name) => `/static/products/${name}.svg`;

module.exports = {
  products: [
    {
      slug: 'two-wheeler-qr-label', title: '2 Wheeler QR Label', subtitle: 'Bikes & Scooters', category: 'TWO_WHEELER', pricePaise: 49900, mrpPaise: 79900,
      rating: 4.8, ratingCount: 860, imageUrl: img('two-wheeler'), gallery: [img('two-wheeler'), img('label-closeup')], stock: 5000, labelsIncluded: 1, labelVehicleType: 'TWO_WHEELER', sortOrder: 2,
      description: 'Weather-proof QR label sized for bikes and scooters. Anyone can scan it to reach you without seeing your number.',
      features: ['Instant contact without sharing your number', 'Weather-proof, UV-resistant print', 'Works with any phone camera - no app needed', 'Emergency alerts to your phone'],
    },
    {
      slug: 'three-wheeler-qr-label', title: '3 Wheeler QR Label', subtitle: 'Autos & e-Rickshaws', category: 'THREE_WHEELER', pricePaise: 59900, mrpPaise: 89900,
      rating: 4.7, ratingCount: 312, imageUrl: img('three-wheeler'), gallery: [img('three-wheeler'), img('label-closeup')], stock: 5000, labelsIncluded: 1, labelVehicleType: 'THREE_WHEELER', sortOrder: 3,
      description: 'High-visibility label for auto-rickshaws and e-rickshaws.',
      features: ['Instant contact without sharing your number', 'High-visibility reflective border', 'Works with any phone camera', 'Emergency alerts to your phone'],
    },
    {
      slug: 'four-wheeler-qr-label', title: '4 Wheeler QR Label', subtitle: 'Perfect for Cars & SUVs', category: 'FOUR_WHEELER', pricePaise: 99900, mrpPaise: 149900,
      rating: 4.9, ratingCount: 1200, imageUrl: img('four-wheeler'), gallery: [img('four-wheeler'), img('label-closeup'), img('windshield')], stock: 5000, labelsIncluded: 1, labelVehicleType: 'FOUR_WHEELER', sortOrder: 1,
      description: 'Windshield-friendly QR label for cars and SUVs. Bystanders can call or alert you privately when your car blocks a road or needs attention.',
      features: ['Instant contact without sharing your number', 'Inside-windshield mounting, glare-free', 'Works with any phone camera - no app needed', 'Call history and alerts in the app'],
    },
    {
      slug: 'commercial-qr-label', title: 'Commercial Vehicle QR Label', subtitle: 'Trucks, Buses & Fleets', category: 'COMMERCIAL', pricePaise: 129900, mrpPaise: 179900,
      rating: 4.6, ratingCount: 140, imageUrl: img('commercial'), gallery: [img('commercial'), img('label-closeup')], stock: 2000, labelsIncluded: 1, labelVehicleType: 'COMMERCIAL', sortOrder: 4,
      description: 'Large-format label for trucks, buses and fleet vehicles.',
      features: ['Large print readable from a distance', 'Industrial adhesive', 'Fleet-ready: manage many vehicles in one account', 'Emergency alerts to your phone'],
    },
    {
      slug: 'complete-protection-package', title: 'Complete Protection Package', subtitle: '5 labels for any vehicle type', category: 'PACKAGE', pricePaise: 599900, mrpPaise: 749900,
      rating: 4.8, ratingCount: 95, imageUrl: img('package'), gallery: [img('package'), img('label-closeup')], stock: 1000, labelsIncluded: 5, labelVehicleType: 'ANY', sortOrder: 0,
      description: 'Five universal labels that can be linked to any of your vehicles. Note: PDF §0 item 8 flags the original "Income plan" product for legal review; this listing sells labels only.',
      features: ['5 universal QR labels', 'Link each label to any vehicle type', 'Priority support', 'Free delivery value pack'],
    },
  ],

  fastagIssuers: [
    { code: 'ICICI', name: 'ICICI Bank', sortOrder: 1 }, { code: 'HDFC', name: 'HDFC Bank', sortOrder: 2 }, { code: 'SBI', name: 'State Bank of India', sortOrder: 3 },
    { code: 'AXIS', name: 'Axis Bank', sortOrder: 4 }, { code: 'KOTAK', name: 'Kotak Mahindra Bank', sortOrder: 5 }, { code: 'PAYTM', name: 'Paytm Payments Bank', sortOrder: 6 },
    { code: 'AIRTEL', name: 'Airtel Payments Bank', sortOrder: 7 },
  ],

  coupons: [
    { code: 'WELCOME50', description: '₹50 off your first order', type: 'FLAT', value: 5000, minSubtotalPaise: 49900, perUserLimit: 1 },
    { code: 'SAVE10', description: '10% off, up to ₹200', type: 'PERCENT', value: 10, maxDiscountPaise: 20000, minSubtotalPaise: 99900, perUserLimit: 3 },
  ],

  content: [
    {
      slug: 'about', title: 'About Us', version: '2026-07',
      blocks: [
        { type: 'heading', text: 'V Tracker' },
        { type: 'paragraph', text: 'V Tracker is a privacy-first vehicle contact system. Stick a V Tracker QR label on your vehicle and anyone can reach you by scanning it - without ever seeing your phone number and without installing an app.' },
        { type: 'heading', text: 'What we solve' },
        { type: 'bullet', text: 'Phone numbers on dashboards invite spam and harassment.' },
        { type: 'bullet', text: 'Bystanders have no safe way to reach the owner of a vehicle that is blocking a road or in trouble.' },
        { type: 'bullet', text: 'Owners have no single place to manage labels, vehicles, FASTag and documents.' },
      ],
    },
    {
      slug: 'privacy', title: 'Privacy Policy', version: '2026-07',
      blocks: [
        { type: 'heading', text: 'What we collect' },
        { type: 'paragraph', text: 'Your name, e-mail, mobile number (verified by OTP), delivery addresses, vehicles, and - only if you choose - bank details, PAN and vehicle documents.' },
        { type: 'heading', text: 'How contact works' },
        { type: 'paragraph', text: 'When someone scans your label, calls are bridged through a virtual number. Neither side sees the other\'s number. We store only a one-way fingerprint of the caller\'s number to apply blocks and limits.' },
        { type: 'heading', text: 'Security' },
        { type: 'paragraph', text: 'Bank account numbers, PAN, document numbers and document files are encrypted at rest (AES-256-GCM). Document downloads use links that expire after 5 minutes.' },
        { type: 'heading', text: 'Your rights' },
        { type: 'paragraph', text: 'Under the Digital Personal Data Protection Act, 2023 you can ask us to access, correct or erase your data. Write to the support e-mail in the app.' },
      ],
    },
    {
      slug: 'terms', title: 'Terms and Conditions', version: '2026-07',
      blocks: [
        { type: 'heading', text: 'Using V Tracker' },
        { type: 'paragraph', text: 'Labels may only be linked to vehicles you own or are authorised to manage. Misuse of the contact system (harassment, spam, false emergencies) leads to blocking.' },
        { type: 'heading', text: 'Orders and refunds' },
        { type: 'paragraph', text: 'Labels are shipped after payment is confirmed. Unused labels from refunded orders are disabled.' },
        { type: 'heading', text: 'Rewards and withdrawals' },
        { type: 'paragraph', text: 'Scratch-card amounts are decided by V Tracker at the moment of scratching. Withdrawals require a verified PAN and bank account. Minimum withdrawal is ₹500.' },
      ],
    },
  ],

  faqs: [
    { order: 1, question: 'How does V Tracker protect my number?', answer: 'Calls from a label scan are connected through a virtual number, so the caller never sees your number and you never see theirs.' },
    { order: 2, question: 'Does the person scanning need the app?', answer: 'No. Any phone camera opens the V Tracker web page, where they can call you privately or send an alert.' },
    { order: 3, question: 'How do I link a label to my vehicle?', answer: 'When your label arrives, open the Scan tab, scan the label and tap "Link Vehicle". Choose the vehicle or add a new one.' },
    { order: 4, question: 'Can I move a label to another vehicle?', answer: 'Yes. In My Vehicles open the vehicle, tap Manage QR and Unlink. Then scan the label again to link it to the new vehicle.' },
    { order: 5, question: 'When can I withdraw my earnings?', answer: 'After your PAN and bank account are verified. The minimum withdrawal is ₹500 and money usually reaches your bank within one working day.' },
  ],

  pincodes: [
    { pincode: '560001', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban' },
    { pincode: '560034', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban' },
    { pincode: '560100', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban' },
    { pincode: '577201', city: 'Shivamogga', state: 'Karnataka', district: 'Shivamogga' },
    { pincode: '500081', city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad' },
    { pincode: '500032', city: 'Hyderabad', state: 'Telangana', district: 'Rangareddy' },
    { pincode: '411001', city: 'Pune', state: 'Maharashtra', district: 'Pune' },
    { pincode: '400001', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai' },
    { pincode: '110001', city: 'New Delhi', state: 'Delhi', district: 'New Delhi' },
    { pincode: '600001', city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai' },
  ],

  ifsc: [
    { ifsc: 'HDFC0000001', bankName: 'HDFC Bank', branch: 'Mumbai - Sandoz House', city: 'Mumbai' },
    { ifsc: 'HDFC0001234', bankName: 'HDFC Bank', branch: 'Bengaluru - Koramangala', city: 'Bengaluru' },
    { ifsc: 'ICIC0000001', bankName: 'ICICI Bank', branch: 'Mumbai - Nariman Point', city: 'Mumbai' },
    { ifsc: 'SBIN0000813', bankName: 'State Bank of India', branch: 'Bengaluru Main', city: 'Bengaluru' },
    { ifsc: 'UTIB0000009', bankName: 'Axis Bank', branch: 'Bengaluru - MG Road', city: 'Bengaluru' },
    { ifsc: 'KKBK0000958', bankName: 'Kotak Mahindra Bank', branch: 'Hyderabad - Madhapur', city: 'Hyderabad' },
  ],
};
