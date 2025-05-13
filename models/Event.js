import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: false },
});

const Event = mongoose.model('Event', eventSchema);
export default Event;
