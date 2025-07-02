import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  image: String
});

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: String,
  cuisine: String,
  rating: { type: Number, default: 0 },
  menu: [menuItemSchema]
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;