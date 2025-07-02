import express from "express";
import Order from "../models/Order.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, totalPrice } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0 || !totalPrice || totalPrice <= 0) {
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
    console.error("Order error:", error.message);
    res.status(500).json({ error: "Failed to place order" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

export default router;
