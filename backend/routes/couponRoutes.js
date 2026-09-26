const express = require("express");
const router = express.Router();

const {
  getCoupons,
  getFeaturedCoupons,
  getAvailableCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
} = require("../controllers/couponController");

const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/admin");

const { runValidation, rules } = require("../middleware/validate");

router.get("/featured", getFeaturedCoupons);

router.get("/available", protect, getAvailableCoupons);

router.post("/apply", protect, rules.applyCoupon, runValidation, applyCoupon);

router.get("/", protect, adminOnly, getCoupons);

router.post("/", protect, adminOnly, rules.coupon, runValidation, createCoupon);

router.put("/:id", protect, adminOnly, updateCoupon);

router.delete("/:id", protect, adminOnly, deleteCoupon);

module.exports = router;
