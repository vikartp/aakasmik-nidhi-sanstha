import mongoose, { Document, Schema } from 'mongoose';

export interface IScreenshot extends Document {
    userId: mongoose.Types.ObjectId;
    userName: string;
    url: string;
    uploadedAt: Date;
}

const screenshotSchema: Schema<IScreenshot> = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IScreenshot>('Screenshot', screenshotSchema);