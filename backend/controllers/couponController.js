const Coupon = require("../models/Coupon");
const CouponUsage = require("../models/CouponUsage");

exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: coupons.length,
      coupons,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getFeaturedCoupons = async (req, res) => {
  try {
    const now = new Date();

    const coupons = await Coupon.find({
      isActive: true,
      expiresAt: { $gte: now },
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    const availableCoupons = coupons.filter((coupon) => {
      if (coupon.usageLimit === null) {
        return true;
      }

      return coupon.usedCount < coupon.usageLimit;
    });

    res.json({
      success: true,
      coupons: availableCoupons.map((coupon) => ({
        _id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderValue: coupon.minOrderValue,
        maxDiscount: coupon.maxDiscount,
        expiresAt: coupon.expiresAt,
        usageLimit: coupon.usageLimit,
        usedCount: coupon.usedCount,
        usagePerUser: coupon.usagePerUser || 1,
      })),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getAvailableCoupons = async (req, res) => {
  try {
    const now = new Date();

    const coupons = await Coupon.find({
      isActive: true,
      expiresAt: { $gte: now },
    })
      .sort({ createdAt: -1 })
      .lean();

    const usageRecords = await CouponUsage.find({
      user: req.user._id,
    }).lean();

    const usageMap = new Map();

    usageRecords.forEach((usage) => {
      usageMap.set(String(usage.coupon), usage.count);
    });

    const availableCoupons = coupons
      .filter((coupon) => {
        if (
          coupon.usageLimit !== null &&
          coupon.usedCount >= coupon.usageLimit
        ) {
          return false;
        }

        const usedByUser = usageMap.get(String(coupon._id)) || 0;

        return usedByUser < (coupon.usagePerUser || 1);
      })
      .map((coupon) => ({
        _id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderValue: coupon.minOrderValue,
        maxDiscount: coupon.maxDiscount,
        expiresAt: coupon.expiresAt,
        usageLimit: coupon.usageLimit,
        usagePerUser: coupon.usagePerUser || 1,
        usedByUser: usageMap.get(String(coupon._id)) || 0,
      }));

    res.json({
      success: true,
      coupons: availableCoupons,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      expiresAt,
      usageLimit,
      usagePerUser,
      isActive,
    } = req.body;

    const normalizedCode = code.toUpperCase().trim();

    const existing = await Coupon.findOne({
      code: normalizedCode,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A coupon with this code already exists",
      });
    }

    const coupon = await Coupon.create({
      code: normalizedCode,
      discountType,
      discountValue,
      minOrderValue: minOrderValue ?? 0,
      maxDiscount: maxDiscount ?? null,
      expiresAt,
      usageLimit: usageLimit ?? null,
      usagePerUser: usagePerUser ?? 1,
      isActive: isActive ?? true,
    });

    res.status(201).json({
      success: true,
      coupon,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
    };

    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase().trim();
    }

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    res.json({
      success: true,
      coupon,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    await CouponUsage.deleteMany({
      coupon: coupon._id,
    });

    res.json({
      success: true,
      message: "Coupon deleted",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
exports.applyCoupon = async (req, res) => {
  try {
    const { code, orderValue = 0 } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    const normalizedCode = code.toUpperCase().trim();

    const coupon = await Coupon.findOne({
      code: normalizedCode,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    const validity = coupon.isValid(orderValue);

    if (!validity.ok) {
      return res.status(400).json({
        success: false,
        message: validity.message,
      });
    }

    const usage = await CouponUsage.findOne({
      coupon: coupon._id,
      user: req.user._id,
    });

    const usedByUser = usage?.count || 0;
    const usagePerUser = coupon.usagePerUser || 1;

    if (usedByUser >= usagePerUser) {
      return res.status(400).json({
        success: false,
        message:
          "You have already used this coupon the maximum number of times.",
      });
    }

    const discount = coupon.calculateDiscount(orderValue);

    res.json({
      success: true,
      code: coupon.code,
      discount,
      newTotal: Math.max(0, orderValue - discount),
      usagePerUser,
      usedByUser,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
