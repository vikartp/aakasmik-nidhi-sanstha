import mongoose, { Document, Schema } from 'mongoose';

export interface IScreenshot extends Document {
    userId: mongoose.Types.ObjectId;
    url: string;
    publicId: string;
    uploadedAt: Date;
    uploadMonth: string;
    uploadYear: string;
    type: 'payment' | 'qrCode',
    verified: boolean;
    rejected?: string; // Optional field for rejection reason
}

const screenshotSchema: Schema<IScreenshot> = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    uploadMonth: { type: String, required: true, default: new Date().toLocaleString('default', { month: 'long' }) },
    uploadYear: { type: String, required: true, default: new Date().getFullYear().toString() },
    type: { type: String, enum: ['payment', 'qrCode'], required: true, default: 'payment' },
    verified: { type: Boolean, required: true, default: false },
    rejected: { type: String, default: null }
});

export default mongoose.model<IScreenshot>('Screenshot', screenshotSchema);