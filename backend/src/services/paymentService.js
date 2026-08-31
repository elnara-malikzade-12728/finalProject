require("dotenv").config();

const Stripe = require("stripe");
const logger = require("../utils/logger");

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();

  if (!secretKey) {
    const error = new Error(
      "Ödəniş provayderi konfiqurasiya edilməyib.",
    );
    error.status = 500;
    error.code = "STRIPE_NOT_CONFIGURED";
    throw error;
  }

  return new Stripe(secretKey);
}

async function createCheckoutSession({
  user,
  amount,
  currency,
  productName,
  metadata,
  billingPeriod,
}) {
  const stripe = getStripeClient();
  const successUrl = process.env.STRIPE_SUCCESS_URL?.trim();
  const cancelUrl = process.env.STRIPE_CANCEL_URL?.trim();

  if (!successUrl || !cancelUrl) {
    const error = new Error("Stripe yönləndirmə URL-ləri təyin edilməyib.");
    error.status = 500;
    error.code = "STRIPE_URLS_NOT_CONFIGURED";
    throw error;
  }

  const recurring = billingPeriod === "MONTHLY" || billingPeriod === "YEARLY";
  const session = await stripe.checkout.sessions.create({
    mode: recurring ? "subscription" : "payment",
    payment_method_types: ["card"],
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: { name: productName },
          unit_amount: Math.round(Number(amount) * 100),
          ...(recurring ? { recurring: { interval: billingPeriod === "YEARLY" ? "year" : "month" } } : {}),
        },
        quantity: 1,
      },
    ],
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata,
    ...(recurring ? { subscription_data: { metadata } } : {}),
  });

  return session;
}

async function getProviderSubscription(subscriptionId) {
  return getStripeClient().subscriptions.retrieve(subscriptionId);
}

async function cancelProviderSubscriptionAtPeriodEnd(subscriptionId) {
  return getStripeClient().subscriptions.update(subscriptionId, { cancel_at_period_end: true });
}

function verifyWebhookSignature(rawBody, signatureHeader) {
  const stripe = getStripeClient();

  return stripe.webhooks.constructEvent(
    rawBody,
    signatureHeader,
    process.env.STRIPE_WEBHOOK_SECRET,
  );
}

module.exports = {
  createCheckoutSession,
  verifyWebhookSignature,
  getStripeClient,
  getProviderSubscription,
  cancelProviderSubscriptionAtPeriodEnd,
};
