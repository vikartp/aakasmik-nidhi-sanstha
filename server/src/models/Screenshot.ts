import mongoose, { Document, Schema } from 'mongoose';

export interface IScreenshot extends Document {
    userId: mongoose.Types.ObjectId;
    userName: string;
    fatherName: string;
    url: string;
    publicId: string;
    uploadedAt: Date;
    uploadMonth: string;
    type: 'payment' | 'qrCode',
    verified: boolean;
}

const screenshotSchema: Schema<IScreenshot> = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    fatherName: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    uploadMonth: { type: String, required: true, default: new Date().toLocaleString('default', { month: 'long' }) },
    type: { type: String, enum: ['payment', 'qrCode'], required: true, default: 'payment' },
    verified: { type: Boolean, required: true, default: false },
});

export default mongoose.model<IScreenshot>('Screenshot', screenshotSchema);