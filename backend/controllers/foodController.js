const Food = require("../models/Food");

exports.getFoods = async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sort = "-createdAt",
      page = 1,
      limit = 12,
    } = req.query;

    const filter = { isAvailable: true };

    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const allowedSorts = [
      "price",
      "-price",
      "star_rating",
      "-star_rating",
      "createdAt",
      "-createdAt",
      "name",
      "-name",
    ];
    const sortBy = allowedSorts.includes(sort) ? sort : "-createdAt";

    const [items, total] = await Promise.all([
      Food.find(filter).sort(sortBy).skip(skip).limit(limitNum),
      Food.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: items.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      items,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFoodById = async (req, res) => {
  try {
    const item = await Food.findById(req.params.id).populate(
      "reviews.user",
      "fullName",
    );
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Food not found" });
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllFoodsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: "i" };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Food.find(filter)
        .sort({ category: 1, name: 1 })
        .skip(skip)
        .limit(limitNum),
      Food.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: items.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      items,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createFood = async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      star_rating,
      info,
      image,
      isAvailable,

      stock,
    } = req.body;

    if (!name || !category || price === undefined || !image) {
      return res.status(400).json({
        success: false,
        message: "name, category, price and image are required",
      });
    }

    const food = await Food.create({
      name,
      category,
      price,
      star_rating,
      info,
      image,
      isAvailable,

      stock,
    });

    res.status(201).json({ success: true, item: food });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!food)
      return res
        .status(404)
        .json({ success: false, message: "Food not found" });
    res.json({ success: true, item: food });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food)
      return res
        .status(404)
        .json({ success: false, message: "Food not found" });
    res.json({ success: true, message: "Food deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Food.distinct("category");
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { stock } = req.body;
    if (stock === undefined || stock < 0) {
      return res.status(400).json({
        success: false,
        message: "A valid stock quantity is required",
      });
    }
    const food = await Food.findByIdAndUpdate(
      req.params.id,
      { stock, isAvailable: stock > 0 ? true : undefined },
      { new: true, runValidators: true },
    );
    if (!food)
      return res
        .status(404)
        .json({ success: false, message: "Food not found" });
    res.json({ success: true, item: food });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const food = await Food.findById(req.params.id);
    if (!food)
      return res
        .status(404)
        .json({ success: false, message: "Food not found" });

    const alreadyReviewed = food.reviews.find(
      (r) => r.user.toString() === req.user._id.toString(),
    );
    if (alreadyReviewed) {
      return res
        .status(409)
        .json({ success: false, message: "You already reviewed this item" });
    }

    food.reviews.push({
      user: req.user._id,
      userName: req.user.fullName,
      rating,
      comment,
    });

    food.recalculateReviewStats();
    await food.save();

    res.status(201).json({ success: true, item: food });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id).select(
      "reviews numReviews averageRating",
    );
    if (!food)
      return res
        .status(404)
        .json({ success: false, message: "Food not found" });
    res.json({
      success: true,
      numReviews: food.numReviews,
      averageRating: food.averageRating,
      reviews: food.reviews,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food)
      return res
        .status(404)
        .json({ success: false, message: "Food not found" });

    const review = food.reviews.id(req.params.reviewId);
    if (!review)
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });

    const isOwner = review.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this review",
      });
    }

    review.deleteOne();
    food.recalculateReviewStats();
    await food.save();

    res.json({ success: true, item: food });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
