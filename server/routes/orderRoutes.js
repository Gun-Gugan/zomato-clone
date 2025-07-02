import express from "express";
import Order from "../models/Order.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Place a new order
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, totalPrice } = req.body;

    if (
      !items || !Array.isArray(items) || items.length === 0 ||
      !totalPrice || typeof totalPrice !== "number" || totalPrice <= 0
    ) {
      return res.status(400).json({ error: "Invalid order data" });
    }

    const order = new Order({
      user: req.user.id,
      items,
      totalPrice,
      status: "Pending",
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to place order" });
  }
});

// Get all orders for the logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

export default router;
