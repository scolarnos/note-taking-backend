import { Schema, model } from 'mongoose';
const NoteSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});
export default model('Note', NoteSchema);
