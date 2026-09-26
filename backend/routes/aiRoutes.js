const express = require("express");
const router = express.Router();
const {
  chat,
  smartSearch,
  recommendations,
  upsell,
} = require("../controllers/aiController");
const { aiLimiter } = require("../middleware/rateLimiter");

router.post("/chat", aiLimiter, chat);
router.post("/search", aiLimiter, smartSearch);
router.get("/recommendations/:userId", aiLimiter, recommendations);
router.post("/upsell", aiLimiter, upsell);

module.exports = router;
