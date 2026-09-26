const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000, default: "" },
  },
  { timestamps: true },
);

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    star_rating: { type: Number, default: 4.5, min: 0, max: 5 },
    info: { type: String, default: "" },
    image: { type: String, required: true }, // path or full URL
    isAvailable: { type: Boolean, default: true },
    stock: { type: Number, default: 100, min: 0 },
    reviews: [reviewSchema],
    numReviews: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true },
);

foodSchema.methods.recalculateReviewStats = function () {
  this.numReviews = this.reviews.length;
  if (this.numReviews === 0) {
    this.averageRating = 0;
    return;
  }
  const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
  this.averageRating = Math.round((total / this.numReviews) * 10) / 10;
  this.star_rating = this.averageRating;
};

foodSchema.index({ name: "text", category: "text" });

module.exports = mongoose.model("Food", foodSchema);
