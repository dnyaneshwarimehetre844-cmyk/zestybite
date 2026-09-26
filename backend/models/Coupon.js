const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    discountType: {
      type: String,
      enum: ["percentage", "flat"],
      default: "percentage",
    },

    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },

    minOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxDiscount: {
      type: Number,
      default: null,
      min: 0,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    usageLimit: {
      type: Number,
      default: null,
      min: 1,
    },

    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    usagePerUser: {
      type: Number,
      default: 1,
      min: 1,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

couponSchema.methods.isValid = function (orderValue = 0) {
  if (!this.isActive) {
    return {
      ok: false,
      message: "Coupon is not active",
    };
  }

  if (this.expiresAt < new Date()) {
    return {
      ok: false,
      message: "Coupon has expired",
    };
  }

  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
    return {
      ok: false,
      message: "Coupon usage limit reached",
    };
  }

  if (orderValue < this.minOrderValue) {
    return {
      ok: false,
      message: `Minimum order value is Rs ${this.minOrderValue}`,
    };
  }

  return { ok: true };
};

couponSchema.methods.calculateDiscount = function (orderValue) {
  let discount =
    this.discountType === "percentage"
      ? (orderValue * this.discountValue) / 100
      : this.discountValue;

  if (this.maxDiscount !== null) {
    discount = Math.min(discount, this.maxDiscount);
  }

  return Math.min(discount, orderValue);
};

module.exports = mongoose.model("Coupon", couponSchema);
