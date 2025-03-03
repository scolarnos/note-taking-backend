import { Schema, model } from 'mongoose';

const noteSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  pinned: { type: Boolean, default: false } // Add pinned field
});

export default model('Note', noteSchema);