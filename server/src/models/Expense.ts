import mongoose, { Document, Schema } from "mongoose";
export interface IExpense extends Document {
    amount: number;
    description: string;
    updatedBy: string;
}

const expenseSchema: Schema<IExpense> = new Schema(
    {
        amount: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            required: true,
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

export default mongoose.model<IExpense>("Expense", expenseSchema);