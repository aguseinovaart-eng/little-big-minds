// Creates a Stripe Checkout Session and returns its URL.
// The secret key lives ONLY in the Netlify env var STRIPE_SECRET_KEY (never in the browser).
//
// Security notes:
// - The PRICE is decided HERE on the server, never trusted from the browser.
// - The productId from the browser is validated against a known list, so a bad or
//   "coming soon" id cannot start a checkout.
const Stripe = require("stripe");

// Server-side source of truth for what can be bought.
const PRODUCTS = {
  "santas-magical-mission": {
    name: "Santa's Magical Mission — Christmas Activity Book (Ages 3–5)",
    amount: 599, // in cents => €5.99
    currency: "eur",
    available: true,
  },
  // Examples for later (kept unavailable until their files are ready):
  "spooky-smart-halloween": { name: "Spooky Smart Halloween", amount: 599, currency: "eur", available: false },
  "dino-discovery":        { name: "Dino Discovery",         amount: 599, currency: "eur", available: false },
};

function json(statusCode, obj) {
  return { statusCode, headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method Not Allowed" });

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return json(500, { error: "Payment isn't set up yet. Please try again later." });

  // Which product? Default keeps older buttons working.
  let productId = "santas-magical-mission";
  try {
    if (event.body) {
      const b = JSON.parse(event.body);
      if (b && b.productId) productId = String(b.productId);
    }
  } catch (e) { /* ignore bad JSON, use default */ }

  const product = PRODUCTS[productId];
  if (!product) return json(400, { error: "Sorry, we couldn't find that bundle." });
  if (!product.available) return json(409, { error: "This bundle isn't available yet — coming soon!" });

  const stripe = Stripe(secret);
  const siteUrl = process.env.URL || `https://${event.headers.host}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: product.currency,
            product_data: { name: product.name },
            unit_amount: product.amount,
          },
          quantity: 1,
        },
      ],
      // Stripe replaces {CHECKOUT_SESSION_ID} with the real id after payment.
      success_url: `${siteUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/product.html?checkout=cancelled`,
    });
    return json(200, { url: session.url });
  } catch (e) {
    return json(500, { error: e.message });
  }
};
