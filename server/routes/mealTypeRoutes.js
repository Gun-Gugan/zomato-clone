import express from "express";
import { getMealTypes } from "../controllers/mealTypeController.js";

const router = express.Router();
router.get("/", getMealTypes);
export default router;
