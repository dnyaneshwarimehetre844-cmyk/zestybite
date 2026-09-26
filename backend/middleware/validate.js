const { validationResult, body, param } = require("express-validator");

const runValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }

  next();
};

const rules = {
  signup: [
    body("fullName").trim().notEmpty().withMessage("Full name is required"),

    body("email")
      .isEmail()
      .withMessage("A valid email is required")
      .normalizeEmail(),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],

  login: [
    body("email")
      .isEmail()
      .withMessage("A valid email is required")
      .normalizeEmail(),

    body("password").notEmpty().withMessage("Password is required"),
  ],

  forgotPassword: [
    body("email")
      .isEmail()
      .withMessage("A valid email is required")
      .normalizeEmail(),
  ],
  updateProfile: [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),

    body("newEmail")
      .optional({ checkFalsy: true })
      .isEmail()
      .withMessage("A valid email is required")
      .normalizeEmail(),

    body("newPassword")
      .optional({ checkFalsy: true })
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
  ],
  resetPassword: [
    param("token").notEmpty().withMessage("Reset token is required"),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],

  createFood: [
    body("name").trim().notEmpty().withMessage("Food name is required"),

    body("category").trim().notEmpty().withMessage("Category is required"),

    body("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),

    body("stock")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Stock must be a positive integer"),
  ],

  review: [
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),

    body("comment")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Comment is too long"),
  ],

  coupon: [
    body("code").trim().notEmpty().withMessage("Coupon code is required"),

    body("discountType")
      .isIn(["percentage", "flat"])
      .withMessage("Invalid discount type"),

    body("discountValue")
      .isFloat({ min: 0 })
      .withMessage("Discount value must be positive"),

    body("minOrderValue")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Minimum order value must be positive"),

    body("maxDiscount")
      .optional({ nullable: true })
      .isFloat({ min: 0 })
      .withMessage("Maximum discount must be positive"),

    body("expiresAt")
      .isISO8601()
      .withMessage("A valid expiry date is required"),

    body("usageLimit")
      .optional({ nullable: true })
      .isInt({ min: 1 })
      .withMessage("Usage limit must be at least 1"),

    body("usagePerUser")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Usage per user must be at least 1"),
  ],

  applyCoupon: [
    body("code").trim().notEmpty().withMessage("Coupon code is required"),
  ],
};

module.exports = {
  runValidation,
  rules,
};
