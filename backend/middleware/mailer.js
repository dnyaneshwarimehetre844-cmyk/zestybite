const nodemailer = require("nodemailer");

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log("--- Email (SMTP not configured, printing instead) ---");
    console.log(`To: ${to}\nSubject: ${subject}\n${text || html}`);
    console.log("------------------------------------------------------");
    return { success: true, mocked: true };
  }

  const info = await getTransporter().sendMail({
    from: process.env.SMTP_FROM || `"ZestyBite" <no-reply@zestybite.com>`,
    to,
    subject,
    html,
    text,
  });

  return { success: true, messageId: info.messageId };
};

const sendPasswordResetEmail = async (to, resetUrl) => {
  return sendEmail({
    to,
    subject: "Reset your ZestyBite password",
    text: `You requested a password reset. Use this link (valid 30 minutes): ${resetUrl}\nIf you didn't request this, ignore this email.`,
    html: `
      <p>You requested a password reset for your ZestyBite account.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a> (link valid for 30 minutes).</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });
};

const sendOrderConfirmationEmail = async (to, order) => {
  return sendEmail({
    to,
    subject: `Order Confirmed - #${order._id.toString().slice(-6).toUpperCase()}`,
    text: `Thanks for your order! Total: ${order.total}. We'll notify you as it's prepared and delivered.`,
    html: `
      <p>Thanks for your order, #${order._id.toString().slice(-6).toUpperCase()}!</p>
      <p>Total: <strong>${order.total}</strong></p>
      <p>We'll notify you as your order is prepared and delivered.</p>
    `,
  });
};
const escapeHtml = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
const sendWelcomeEmail = async (to, fullName) => {
  const name = escapeHtml(fullName || "there");
  return sendEmail({
    to,
    subject: "Welcome to ZestyBite - you signed up successfully!",
    text: `Hi ${name}, you have signed up successfully on ZestyBite. Start ordering your favourite food now!`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px">
        <h2 style="color:#ff6a00">Welcome to ZestyBite, ${name}!</h2>
        <p>You have <strong>signed up successfully</strong> on ZestyBite.</p>
        <p>Start ordering your favourite food now.</p>
        <p style="color:#888;font-size:12px">If you did not create this account, please ignore this email.</p>
      </div>
    `,
  });
};

module.exports = {
  sendEmail,
  escapeHtml,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
};
