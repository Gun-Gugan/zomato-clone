import express from "express";
import mongoose from "mongoose";
import Restaurant from "../models/Restaurant.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (err) {
    console.error("Error fetching restaurants:", err.message);
    res.status(500).json({ error: "Failed to fetch restaurants" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid restaurant ID" });
    }
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.json(restaurant);
  } catch (error) {
    console.error("Error fetching restaurant:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;