import mongoose, { Document, Schema } from 'mongoose';

export interface IScreenshot extends Document {
  user: mongoose.Types.ObjectId;
  imageUrl: string;
  uploadedAt: Date;
}

const screenshotSchema: Schema<IScreenshot> = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IScreenshot>('Screenshot', screenshotSchema);