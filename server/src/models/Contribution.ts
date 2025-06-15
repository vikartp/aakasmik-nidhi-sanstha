import mongoose, { Document, Schema } from 'mongoose';
export interface IContribution extends Document {
    userId: mongoose.Types.ObjectId; // This contribution belongs to member/user ID
    verifiedBy: mongoose.Types.ObjectId; // ID of the admin who verified the contribution
    screenshotId?: mongoose.Types.ObjectId; // Optional screenshot ID if a screenshot is associated with the contribution
    amount: number; // Amount contributed
    month: string; // Month of contribution (e.g., 'January', 'February')
    year: number; // Year of contribution (e.g., 2023)
    createdAt: Date; // Date when the contribution was made
    updatedAt: Date; // Date when the contribution was last updated
}
const contributionSchema: Schema<IContribution> = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    screenshotId: { type: Schema.Types.ObjectId, ref: 'Screenshot' },
    amount: { type: Number, required: true },
    month: { type: String, required: true },
    year: { type: Number, required: true },
}, {
    timestamps: true // Automatically manage createdAt and updatedAt fields
});

export default mongoose.model<IContribution>('Contribution', contributionSchema);