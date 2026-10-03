const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  googleAuth,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  updateAvatar,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/admin");
const {
  authLimiter,
  passwordResetLimiter,
} = require("../middleware/rateLimiter");
const { runValidation, rules } = require("../middleware/validate");
const { upload, compressImage } = require("../middleware/upload");

router.post("/signup", authLimiter, rules.signup, runValidation, signup);
router.post("/login", authLimiter, rules.login, runValidation, login);
router.get("/me", protect, getMe);
router.post("/google", authLimiter, googleAuth);
router.put(
  "/profile",
  protect,
  rules.updateProfile,
  runValidation,
  updateProfile,
);
router.post(
  "/forgot-password",
  passwordResetLimiter,
  rules.forgotPassword,
  runValidation,
  forgotPassword,
);
router.put(
  "/reset-password/:token",
  passwordResetLimiter,
  rules.resetPassword,
  runValidation,
  resetPassword,
);
router.put(
  "/avatar",
  protect,
  upload.single("avatar"),
  compressImage,
  updateAvatar,
);
module.exports = router;
