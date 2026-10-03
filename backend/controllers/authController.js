const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const dns = require("dns").promises;
const { OAuth2Client } = require("google-auth-library");
const {
  sendPasswordResetEmail,
  sendWelcomeEmail,
} = require("../middleware/mailer");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const userPayload = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  avatar: user.avatar || null,
});

const domainCanReceiveMail = async (email) => {
  const domain = String(email).split("@")[1];
  if (!domain) return false;
  try {
    const mx = await dns.resolveMx(domain);
    return mx.length > 0;
  } catch (err) {
    if (err.code === "ENOTFOUND" || err.code === "ENODATA") return false;
    return true;
  }
};

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

exports.signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!(await domainCanReceiveMail(email))) {
      return res.status(400).json({
        success: false,
        message: "Please enter a real email address that can receive mail",
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          existing.authProvider === "google" && !existing.password
            ? "This email is registered with Google. Please use Google sign in."
            : "Email already registered",
      });
    }

    const user = await User.create({ fullName, email, password });
    const token = signToken(user._id);

    sendWelcomeEmail(user.email, user.fullName).catch((e) =>
      console.error("Welcome email failed:", e.message),
    );

    res.status(201).json({ success: true, token, user: userPayload(user) });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: err.message || "Signup failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (user && !user.password) {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google sign in. Please continue with Google.",
      });
    }
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = signToken(user._id);

    res.json({ success: true, token, user: userPayload(user) });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: err.message || "Login failed" });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential || !process.env.GOOGLE_CLIENT_ID) {
      return res
        .status(400)
        .json({ success: false, message: "Google sign in is not configured" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload.email_verified) {
      return res
        .status(400)
        .json({ success: false, message: "Google email is not verified" });
    }

    const email = payload.email.toLowerCase();
    let user = await User.findOne({ email });
    let isNew = false;

    if (!user) {
      user = await User.create({
        fullName: payload.name || email.split("@")[0],
        email,
        googleId: payload.sub,
        authProvider: "google",
        avatar: payload.picture || null,
      });
      isNew = true;
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      await user.save({ validateBeforeSave: false });
    }

    if (isNew) {
      sendWelcomeEmail(user.email, user.fullName).catch((e) =>
        console.error("Welcome email failed:", e.message),
      );
    }

    res.json({
      success: true,
      token: signToken(user._id),
      user: userPayload(user),
    });
  } catch (err) {
    res.status(401).json({ success: false, message: "Google sign in failed" });
  }
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

exports.updateAvatar = async (req, res) => {
  try {
    if (!req.body.image) {
      return res
        .status(400)
        .json({ success: false, message: "No image uploaded" });
    }

    req.user.avatar = req.body.image;
    await req.user.save();

    res.json({ success: true, user: userPayload(req.user) });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: err.message || "Avatar update failed" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    const genericResponse = {
      success: true,
      message:
        "If that email is registered, a password reset link has been sent.",
    };

    if (!user) return res.json(genericResponse);

    const rawToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${(process.env.CLIENT_URL || "http://localhost:5173").split(",")[0].trim()}/reset-password/${rawToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (emailErr) {
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save({ validateBeforeSave: false });
      console.error("Failed to send reset email:", emailErr.message);
      return res.status(500).json({
        success: false,
        message: "Could not send reset email, try again later",
      });
    }

    res.json(genericResponse);
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: err.message || "Request failed" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { currentPassword, newEmail, newPassword, fullName } = req.body;

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Current password is incorrect" });
    }

    if (fullName) user.fullName = fullName;

    if (newEmail && newEmail.toLowerCase() !== user.email) {
      const existing = await User.findOne({ email: newEmail.toLowerCase() });
      if (existing) {
        return res
          .status(409)
          .json({ success: false, message: "Email already registered" });
      }
      user.email = newEmail.toLowerCase();
    }

    if (newPassword) {
      user.password = newPassword;
    }

    await user.save();

    res.json({ success: true, user: userPayload(user) });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Profile update failed",
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired",
      });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    const jwtToken = signToken(user._id);

    res.json({
      success: true,
      message: "Password has been reset successfully",
      token: jwtToken,
      user: userPayload(user),
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: err.message || "Reset failed" });
  }
};
