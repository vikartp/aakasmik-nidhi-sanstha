import mongoose, { Document, Schema } from 'mongoose';
export interface IContribution extends Document {
    userId: mongoose.Types.ObjectId; // This contribution belongs to member/user ID
    amount: number; // Amount contributed
    verifiedBy: string; // Name of the admin who verified the contribution
    screenshotId?: mongoose.Types.ObjectId; // Optional screenshot ID if a screenshot is associated with the contribution
    contributionDate: Date; // Date of the contribution
    createdAt: Date; // Date when the contribution was made
    updatedAt: Date; // Date when the contribution was last updated
}
const contributionSchema: Schema<IContribution> = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    verifiedBy: { type: String, required: true },
    screenshotId: { type: Schema.Types.ObjectId, ref: 'Screenshot' },
    contributionDate: { type: Date, default: Date.now },
}, {
    timestamps: true // Automatically manage createdAt and updatedAt fields
});

export default mongoose.model<IContribution>('Contribution', contributionSchema);