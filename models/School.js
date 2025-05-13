// models/School.js
import mongoose from 'mongoose';

const schoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

export default mongoose.model('School', schoolSchema);
