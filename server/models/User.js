import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: String,
  loginOtp: { type: String },
  loginOtpExpires: { type: Date },
  resetOtp: { type: String },
  resetOtpExpires: { type: Date },
  deleteOtp: { type: String },
  deleteOtpExpires: { type: Date },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
