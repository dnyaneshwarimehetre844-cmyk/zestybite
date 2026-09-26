const Order = require("../models/Order");
const Food = require("../models/Food");
const Coupon = require("../models/Coupon");
const CouponUsage = require("../models/CouponUsage");

const { createPayment } = require("../middleware/payment");

const { sendOrderConfirmationEmail } = require("../middleware/mailer");

const rollbackStock = async (decrementedItems) => {
  for (const { foodId, qty } of decrementedItems) {
    try {
      const restored = await Food.findByIdAndUpdate(
        foodId,
        {
          $inc: {
            stock: qty,
          },
        },
        {
          new: true,
        },
      );

      if (restored && restored.stock > 0 && !restored.isAvailable) {
        restored.isAvailable = true;
        await restored.save();
      }
    } catch (e) {
      console.error("Stock rollback failed:", foodId, e.message);
    }
  }
};

const rollbackCouponUsage = async (couponId, userId) => {
  try {
    await Coupon.findByIdAndUpdate(couponId, {
      $inc: {
        usedCount: -1,
      },
    });

    const usage = await CouponUsage.findOne({
      coupon: couponId,
      user: userId,
    });

    if (usage) {
      if (usage.count <= 1) {
        await CouponUsage.deleteOne({
          _id: usage._id,
        });
      } else {
        usage.count -= 1;
        await usage.save();
      }
    }
  } catch (err) {
    console.error("Coupon usage rollback failed:", err.message);
  }
};

exports.createOrder = async (req, res) => {
  const decrementedItems = [];

  let consumedCoupon = null;

  try {
    const {
      items,
      deliveryInfo,
      subtotal,
      deliveryFee,
      couponCode,
      paymentMethod,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    for (const item of items) {
      if (!item.food) {
        await rollbackStock(decrementedItems);

        return res.status(400).json({
          success: false,
          message: `Food ID missing for ${item.name || "an item"}`,
        });
      }

      const food = await Food.findOneAndUpdate(
        {
          _id: item.food,
          stock: {
            $gte: item.qty,
          },
        },
        {
          $inc: {
            stock: -item.qty,
          },
        },
        {
          new: true,
        },
      );

      if (!food) {
        await rollbackStock(decrementedItems);

        return res.status(409).json({
          success: false,
          message: `Not enough stock for ${item.name || "an item"}`,
        });
      }

      decrementedItems.push({
        foodId: item.food,
        qty: item.qty,
      });

      if (food.stock === 0 && food.isAvailable) {
        food.isAvailable = false;
        await food.save();
      }
    }

    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const normalizedCode = couponCode.toUpperCase().trim();

      appliedCoupon = await Coupon.findOne({
        code: normalizedCode,
      });

      if (!appliedCoupon) {
        await rollbackStock(decrementedItems);

        return res.status(400).json({
          success: false,
          message: "Invalid coupon code",
        });
      }

      const validity = appliedCoupon.isValid(subtotal);

      if (!validity.ok) {
        await rollbackStock(decrementedItems);

        return res.status(400).json({
          success: false,
          message: validity.message,
        });
      }

      const existingUsage = await CouponUsage.findOne({
        coupon: appliedCoupon._id,
        user: req.user._id,
      });

      const usedByUser = existingUsage?.count || 0;

      const usagePerUser = appliedCoupon.usagePerUser || 1;

      if (usedByUser >= usagePerUser) {
        await rollbackStock(decrementedItems);

        return res.status(400).json({
          success: false,
          message:
            "You have already used this coupon the maximum number of times.",
        });
      }

      discount = appliedCoupon.calculateDiscount(subtotal);

      const usageFilter = {
        _id: appliedCoupon._id,
      };

      if (appliedCoupon.usageLimit !== null) {
        usageFilter.usedCount = {
          $lt: appliedCoupon.usageLimit,
        };
      }

      const consumed = await Coupon.findOneAndUpdate(
        usageFilter,
        {
          $inc: {
            usedCount: 1,
          },
        },
        {
          new: true,
        },
      );

      if (!consumed) {
        await rollbackStock(decrementedItems);

        return res.status(400).json({
          success: false,
          message: "Coupon usage limit reached",
        });
      }

      if (existingUsage) {
        existingUsage.count += 1;
        await existingUsage.save();
      } else {
        try {
          await CouponUsage.create({
            coupon: appliedCoupon._id,
            user: req.user._id,
            count: 1,
          });
        } catch (usageError) {
          const retryUsage = await CouponUsage.findOneAndUpdate(
            {
              coupon: appliedCoupon._id,
              user: req.user._id,
            },
            {
              $inc: {
                count: 1,
              },
            },
            {
              new: true,
            },
          );

          if (!retryUsage) {
            await Coupon.findByIdAndUpdate(appliedCoupon._id, {
              $inc: {
                usedCount: -1,
              },
            });

            await rollbackStock(decrementedItems);

            throw usageError;
          }
        }
      }

      consumedCoupon = appliedCoupon;
    }

    const finalDeliveryFee = deliveryFee ?? 50;

    const total = Math.max(0, subtotal + finalDeliveryFee - discount);

    let order;

    try {
      order = await Order.create({
        user: req.user._id,

        items,

        deliveryInfo,

        subtotal,

        deliveryFee: finalDeliveryFee,

        coupon: appliedCoupon
          ? {
              code: appliedCoupon.code,
              discount,
            }
          : undefined,

        total,

        paymentMethod: paymentMethod === "online" ? "online" : "cod",
      });
    } catch (createErr) {
      await rollbackStock(decrementedItems);

      if (consumedCoupon) {
        await rollbackCouponUsage(consumedCoupon._id, req.user._id);
      }

      throw createErr;
    }

    let paymentInfo = null;

    if (paymentMethod === "online") {
      paymentInfo = await createPayment({
        amount: total,
        orderId: order._id,
        email: deliveryInfo?.email || req.user.email,
      });

      order.paymentId = paymentInfo.paymentId;

      order.paymentStatus = paymentInfo.status === "paid" ? "paid" : "pending";

      await order.save();
    }

    sendOrderConfirmationEmail(
      deliveryInfo?.email || req.user.email,
      order,
    ).catch((e) =>
      console.error("Order confirmation email failed:", e.message),
    );

    res.status(201).json({
      success: true,
      order,
      payment: paymentInfo || undefined,
    });
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      orders,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);

    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));

    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user", "fullName email")
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limitNum),

      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: orders.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      orders,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const existing = await Order.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const wasAlreadyCancelled = existing.status === "cancelled";

    existing.status = status;

    await existing.save();

    if (status === "cancelled" && !wasAlreadyCancelled) {
      await rollbackStock(
        existing.items.map((item) => ({
          foodId: item.food,
          qty: item.qty,
        })),
      );

      if (existing.coupon?.code) {
        const coupon = await Coupon.findOne({
          code: existing.coupon.code,
        });

        if (coupon) {
          await rollbackCouponUsage(coupon._id, existing.user);
        }
      }
    }

    res.json({
      success: true,
      order: existing,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
