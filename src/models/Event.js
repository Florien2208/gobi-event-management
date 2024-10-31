// app/models/Event.js
import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 0,
  },
});

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
