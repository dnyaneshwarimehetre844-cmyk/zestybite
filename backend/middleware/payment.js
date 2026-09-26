
const isStripeConfigured = () => !!process.env.STRIPE_SECRET_KEY;

const getStripe = () => {
  const Stripe = require("stripe");
  return Stripe(process.env.STRIPE_SECRET_KEY);
};
const createPayment = async ({ amount, currency = "inr", orderId, email }) => {
  if (!isStripeConfigured()) {
    
    return {
      mocked: true,
      paymentId: `mock_${orderId}_${Date.now()}`,
      status: "paid",
    };
  }

  const stripe = getStripe();
  const intent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), 
    currency,
    receipt_email: email,
    metadata: { orderId: String(orderId) },
  });

  return {
    mocked: false,
    paymentId: intent.id,
    clientSecret: intent.client_secret,
    status: "pending",
  };
};

const verifyPayment = async (paymentId) => {
  if (!isStripeConfigured() || paymentId.startsWith("mock_")) {
    return { verified: true, status: "paid" };
  }
  const stripe = getStripe();
  const intent = await stripe.paymentIntents.retrieve(paymentId);
  return { verified: intent.status === "succeeded", status: intent.status };
};

module.exports = { createPayment, verifyPayment, isStripeConfigured };
