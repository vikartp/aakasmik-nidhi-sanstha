import mongoose, { Document, Schema } from 'mongoose';

export interface UserSecret extends Document {
    mobile: string; // Reference to the user
    secret: string; // The secret value
    createdAt: Date; // Timestamp of when the secret was created
    createdBy: string; // User ID of the creator
}
const userSecretSchema: Schema<UserSecret> = new Schema({
    mobile: { type: String, required: true, unique: true }, // Unique mobile number for the user
    secret: { type: String, required: true }, // The secret value
    createdAt: { type: Date, default: Date.now }, // Timestamp of creation
    createdBy: { type: String, required: true } // User ID of the creator
}, {
    timestamps: true // Automatically manage createdAt and updatedAt fields
});

export default mongoose.model<UserSecret>('UserSecret', userSecretSchema);