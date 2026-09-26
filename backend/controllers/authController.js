const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { sendPasswordResetEmail } = require("../middleware/mailer");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

exports.signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({ fullName, email, password });
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
      },
    });
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
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = signToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: err.message || "Login failed" });
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

    res.json({
      success: true,
      user: {
        id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
      },
    });
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

    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${rawToken}`;

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
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    if (fullName) user.fullName = fullName;

    if (newEmail && newEmail.toLowerCase() !== user.email) {
      const existing = await User.findOne({ email: newEmail.toLowerCase() });
      if (existing) {
        return res.status(409).json({ success: false, message: "Email already registered" });
      }
      user.email = newEmail.toLowerCase();
    }

    if (newPassword) {
      user.password = newPassword;
    }

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Profile update failed" });
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
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: err.message || "Reset failed" });
  }
};
