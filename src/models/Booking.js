// models/Booking.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  userId: { type: String, required: true },
  seats: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Booking =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
export default Booking;
