const express = require("express");
const router = express.Router();
const {
  getFoods,
  getFoodById,
  getAllFoodsAdmin,
  createFood,
  updateFood,
  deleteFood,
  getCategories,
  updateStock,
  addReview,
  getReviews,
  deleteReview,
} = require("../controllers/foodController");
const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/admin");
const { upload, compressImage } = require("../middleware/upload");
const { runValidation, rules } = require("../middleware/validate");

router.get("/", getFoods);
router.get("/categories/list", getCategories);

router.get("/admin/all", protect, adminOnly, getAllFoodsAdmin);

router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"),
  compressImage,
  rules.createFood,
  runValidation,
  createFood
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("image"),
  compressImage,
  updateFood
);

router.delete("/:id", protect, adminOnly, deleteFood);
router.patch("/:id/stock", protect, adminOnly, updateStock);

router.get("/:id/reviews", getReviews);
router.post("/:id/reviews", protect, rules.review, runValidation, addReview);
router.delete("/:id/reviews/:reviewId", protect, deleteReview);

router.get("/:id", getFoodById);

module.exports = router;
