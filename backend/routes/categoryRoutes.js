const express = require("express");
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/admin");
const { upload, compressImage } = require("../middleware/upload");

router.get("/", getCategories);

router.post("/", protect, adminOnly, upload.single("image"), compressImage, createCategory);
router.put("/:id", protect, adminOnly, upload.single("image"), compressImage, updateCategory);
router.delete("/:id", protect, adminOnly, deleteCategory);

module.exports = router;
