require("dotenv").config();

const Stripe = require("stripe");
const logger = require("../utils/logger");

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

function ensureStripeConfigured() {
  if (!stripe) {
    const error = new Error(
      "Ödəniş provayderi konfiqurasiya edilməyib.",
    );
    error.status = 500;
    throw error;
  }
}

async function createCheckoutSession({
  user,
  amount,
  currency,
  productName,
  metadata,
}) {
  ensureStripeConfigured();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: { name: productName },
          unit_amount: Math.round(Number(amount) * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: process.env.STRIPE_CANCEL_URL,
    metadata,
  });

  return session;
}

function verifyWebhookSignature(rawBody, signatureHeader) {
  ensureStripeConfigured();

  return stripe.webhooks.constructEvent(
    rawBody,
    signatureHeader,
    process.env.STRIPE_WEBHOOK_SECRET,
  );
}

module.exports = {
  createCheckoutSession,
  verifyWebhookSignature,
};