import mongoose, { Document, Schema } from "mongoose";

export interface ISahayata extends Document {
    memberId: mongoose.Types.ObjectId;
    memberName: string;
    amount: number;
    givenDate: Date;
    description?: string;
    repaymentDate?: Date;
    repaidAmount?: number;
    status: 'pending' | 'partial' | 'repaid';
    proofUrl?: string;
    proofPublicId?: string;
    proofType?: 'pdf' | 'image';
    updatedBy: string;
}

const sahayataSchema: Schema<ISahayata> = new Schema(
    {
        memberId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        memberName: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        givenDate: {
            type: Date,
            required: true,
        },
        description: {
            type: String,
            required: false,
        },
        repaymentDate: {
            type: Date,
            required: false,
        },
        repaidAmount: {
            type: Number,
            required: false,
            default: 0,
        },
        status: {
            type: String,
            enum: ['pending', 'partial', 'repaid'],
            default: 'pending',
        },
        proofUrl: {
            type: String,
            required: false,
        },
        proofPublicId: {
            type: String,
            required: false,
        },
        proofType: {
            type: String,
            enum: ['pdf', 'image'],
            required: false,
        },
        updatedBy: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true, // Automatically manage createdAt and updatedAt fields
    }
);

export default mongoose.model<ISahayata>("Sahayata", sahayataSchema);
