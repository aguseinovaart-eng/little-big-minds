// Creates a Stripe Checkout Session and returns its URL.
// The secret key lives ONLY in the Netlify environment variable STRIPE_SECRET_KEY
// (never in the code, never in the browser).
const Stripe = require("stripe");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Stripe key not set yet. Add STRIPE_SECRET_KEY in Netlify." }),
    };
  }

  const stripe = Stripe(secret);
  const siteUrl = process.env.URL || `https://${event.headers.host}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Santa's Magical Mission — Christmas Activity Book (Ages 3–5)",
            },
            unit_amount: 599, // €5.99, in cents
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/#shop`,
    });

    return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
