const { GoogleGenerativeAI } = require("@google/generative-ai");
const Food = require("../models/Food");
const Order = require("../models/Order");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

function cleanJson(text) {
  return text.replace(/```json|```/g, "").trim();
}

const DAILY_AI_BUDGET = Number(process.env.DAILY_AI_BUDGET || 18);
const PER_USER_DAILY_AI_LIMIT = Number(
  process.env.PER_USER_DAILY_AI_LIMIT || 3,
);

let aiCallsToday = 0;
let budgetResetAt = nextMidnight();
const userUsage = new Map(); // identifier -> { count, resetAt }

function nextMidnight() {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d.getTime();
}

function hasAIBudget() {
  if (Date.now() > budgetResetAt) {
    aiCallsToday = 0;
    budgetResetAt = nextMidnight();
  }
  return aiCallsToday < DAILY_AI_BUDGET;
}

function useAIBudget() {
  aiCallsToday += 1;
}

function getIdentifier(req) {
  return req.user?._id?.toString() || req.params?.userId || req.ip;
}

function hasUserBudget(identifier) {
  const entry = userUsage.get(identifier);
  if (!entry || entry.resetAt <= Date.now()) return true;
  return entry.count < PER_USER_DAILY_AI_LIMIT;
}

function useUserBudget(identifier) {
  const entry = userUsage.get(identifier);
  if (!entry || entry.resetAt <= Date.now()) {
    userUsage.set(identifier, { count: 1, resetAt: nextMidnight() });
  } else {
    entry.count += 1;
  }
}

const RECOMMENDATION_CACHE_MS = 10 * 60 * 1000;
const recommendationCache = new Map(); // userId -> { items, expiresAt }

// POST /api/ai/chat
exports.chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || !message.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Message is required" });
    }

    if (!hasAIBudget()) {
      return res.status(503).json({
        success: false,
        message:
          "The assistant has reached its usage limit for today — please try again tomorrow.",
      });
    }

    const identifier = getIdentifier(req);
    if (!hasUserBudget(identifier)) {
      return res.status(503).json({
        success: false,
        message: `You've reached your assistant usage limit for today (${PER_USER_DAILY_AI_LIMIT} requests) — please try again tomorrow.`,
      });
    }

    const menu = await Food.find({ isAvailable: true })
      .select("_id name category price star_rating info")
      .limit(60);

    const menuText = menu
      .map(
        (f) =>
          `${f._id} | ${f.name} | ${f.category} | ₹${f.price} | ${f.star_rating}★`,
      )
      .join("\n");

    const historyText = history
      .slice(-6)
      .map(
        (h) => `${h.role === "assistant" ? "Assistant" : "User"}: ${h.content}`,
      )
      .join("\n");

    const prompt = `You are ZestyBite's ordering assistant.
Only recommend dishes from the MENU list below — never invent dishes or prices.
Answer naturally and helpfully (delivery, ingredients, spice level, recommendations).

MENU (id | name | category | price | rating):
${menuText}

Recent conversation:
${historyText}

User: ${message}

Respond ONLY with valid JSON, no markdown fences, no extra text:
{"reply": "your natural-language answer", "suggestedIds": ["<menu _id values you recommend, if any>"]}`;

    useAIBudget();
    useUserBudget(identifier);
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();
    const cleaned = cleanJson(raw);

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { reply: raw, suggestedIds: [] };
    }

    const validIds = (parsed.suggestedIds || []).filter((id) =>
      menu.some((f) => f._id.toString() === id),
    );
    const suggestions = validIds.length
      ? await Food.find({ _id: { $in: validIds } }).select(
          "_id name price image star_rating",
        )
      : [];

    res.json({ success: true, reply: parsed.reply, suggestions });
  } catch (err) {
    console.error(err);
    const isQuotaOrOverload = err.status === 429 || err.status === 503;
    res.status(503).json({
      success: false,
      message: isQuotaOrOverload
        ? "I'm getting a lot of requests right now — please try again in a minute."
        : "AI assistant is unavailable right now",
    });
  }
};

exports.smartSearch = async (req, res) => {
  try {
    const { query } = req.body;

    if (!hasAIBudget()) {
      return res.status(503).json({
        success: false,
        message: "Smart search has reached its usage limit for today.",
      });
    }

    const identifier = getIdentifier(req);
    if (!hasUserBudget(identifier)) {
      return res.status(503).json({
        success: false,
        message: `You've reached your search usage limit for today (${PER_USER_DAILY_AI_LIMIT} requests).`,
      });
    }

    const menu = await Food.find({ isAvailable: true }).select(
      "_id name category price star_rating info",
    );
    const menuText = menu
      .map(
        (f) =>
          `${f._id} | ${f.name} | ${f.category} | ₹${f.price} | ${f.star_rating}★`,
      )
      .join("\n");

    const prompt = `Match the user's request to items in this MENU. Return ONLY JSON, no fences: {"ids": ["<matching _id values>"]}
MENU:\n${menuText}

User request: ${query}`;

    useAIBudget();
    useUserBudget(identifier);
    const result = await model.generateContent(prompt);
    const cleaned = cleanJson(result.response.text());
    const { ids = [] } = JSON.parse(cleaned);
    const validIds = ids.filter((id) =>
      menu.some((f) => f._id.toString() === id),
    );
    const items = await Food.find({ _id: { $in: validIds } });
    res.json({ success: true, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Search failed" });
  }
};

exports.recommendations = async (req, res) => {
  try {
    const identifier = getIdentifier(req);

    const cached = recommendationCache.get(req.params.userId);
    if (cached && cached.expiresAt > Date.now()) {
      return res.json({ success: true, items: cached.items });
    }

    const pastOrders = await Order.find({ user: req.params.userId }).limit(10);
    const orderedNames = [
      ...new Set(pastOrders.flatMap((o) => o.items?.map((i) => i.name) || [])),
    ];

    const fallback = await Food.find({ isAvailable: true })
      .sort({ star_rating: -1 })
      .limit(6);

    if (orderedNames.length === 0) {
      recommendationCache.set(req.params.userId, {
        items: fallback,
        expiresAt: Date.now() + RECOMMENDATION_CACHE_MS,
      });
      return res.json({ success: true, items: fallback });
    }

    if (!hasAIBudget() || !hasUserBudget(identifier)) {
      recommendationCache.set(req.params.userId, {
        items: fallback,
        expiresAt: Date.now() + RECOMMENDATION_CACHE_MS,
      });
      return res.json({ success: true, items: fallback });
    }

    const menu = await Food.find({ isAvailable: true }).select(
      "_id name category",
    );
    const menuText = menu
      .map((f) => `${f._id} | ${f.name} | ${f.category}`)
      .join("\n");

    const prompt = `User previously ordered: ${orderedNames.join(", ")}. Suggest 6 similar/complementary items from this MENU. Return ONLY JSON: {"ids":["..."]}\nMENU:\n${menuText}`;

    let items = fallback;
    try {
      useAIBudget();
      useUserBudget(identifier);
      const result = await model.generateContent(prompt);
      const cleaned = cleanJson(result.response.text());
      const { ids = [] } = JSON.parse(cleaned);
      const validIds = ids.filter((id) =>
        menu.some((f) => f._id.toString() === id),
      );
      if (validIds.length) {
        items = await Food.find({ _id: { $in: validIds } });
      }
    } catch (aiErr) {
      console.error(
        "Gemini recommendation call failed, using fallback:",
        aiErr.message,
      );
    }

    recommendationCache.set(req.params.userId, {
      items,
      expiresAt: Date.now() + RECOMMENDATION_CACHE_MS,
    });
    res.json({ success: true, items });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to load recommendations" });
  }
};
exports.upsell = async (req, res) => {
  try {
    const { cartItemNames = [] } = req.body;

    if (!hasAIBudget()) {
      return res.status(503).json({
        success: false,
        message: "Upsell suggestions have reached their usage limit for today.",
      });
    }

    const identifier = getIdentifier(req);
    if (!hasUserBudget(identifier)) {
      return res.status(503).json({
        success: false,
        message: `You've reached your usage limit for today (${PER_USER_DAILY_AI_LIMIT} requests).`,
      });
    }

    const menu = await Food.find({ isAvailable: true }).select(
      "_id name category price",
    );
    const menuText = menu
      .map((f) => `${f._id} | ${f.name} | ${f.category} | ₹${f.price}`)
      .join("\n");

    const prompt = `Cart has: ${cartItemNames.join(", ")}. Suggest 1-2 complementary add-ons (drink/dessert/side) from MENU, not already in cart. Return ONLY JSON: {"ids":["..."], "note": "short friendly line"}\nMENU:\n${menuText}`;

    useAIBudget();
    useUserBudget(identifier);
    const result = await model.generateContent(prompt);
    const cleaned = cleanJson(result.response.text());
    const { ids = [], note = "" } = JSON.parse(cleaned);
    const validIds = ids.filter((id) =>
      menu.some((f) => f._id.toString() === id),
    );
    const items = await Food.find({ _id: { $in: validIds } });
    res.json({ success: true, items, note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Upsell failed" });
  }
};
