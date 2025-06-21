import mongoose, { Document, Schema } from "mongoose";
export interface IFeedback extends Document {
    userName: string; // Name of the user who provided the feedback
    fatherName: string;
    content: string; // The feedback content
    target: "admin" | "superadmin"; // Target audience for the feedback
}

const feedbackSchema: Schema<IFeedback> = new Schema(
    {
        userName: { type: String, required: true },
        fatherName: { type: String, required: true },
        content: { type: String, required: true },
        target: {
            type: String,
            enum: ["admin", "superadmin"],
            required: true,
        },
    },
    {
        timestamps: true, // Automatically manage createdAt and updatedAt fields
    }
);

export default mongoose.model<IFeedback>("Feedback", feedbackSchema);