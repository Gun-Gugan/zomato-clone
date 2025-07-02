import MealType from "../models/MealType.js";

export const getMealTypes = async (req, res) => {
  try {
    const meals = await MealType.find();
    res.json(meals);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch meal types" });
  }
};
