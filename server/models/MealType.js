import mongoose from 'mongoose';

const mealTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Meal type name is required'],
    trim: true,
    maxlength: [100, 'Meal type name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Meal type description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  image: {
    type: String,
    required: [true, 'Meal type image URL is required'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Meal type price is required'],
    min: [0, 'Price cannot be negative'],
    default: 299.99,
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant ID is required'],
  },
}, {
  timestamps: true,
});

mealTypeSchema.index({ name: 'text', description: 'text' });

const MealType = mongoose.model('MealType', mealTypeSchema);
export default MealType;

