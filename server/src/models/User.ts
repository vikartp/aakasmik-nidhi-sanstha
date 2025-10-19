import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    mobile: string;
    password: string;
    name: string;
    fatherName: string;
    role: 'member' | 'admin' | 'superadmin';
    email?: string;
    occupation?: string;
    membershipDate?: Date; // Optional, if you want to track when the user became a member
    profileUrl?: string; // Optional, if you want to store a profile picture URL
    verified: boolean;
    createdAt: Date;
}

const userSchema = new Schema({
    mobile: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(v: string) {
                // Example: Validates 10-digit mobile number (e.g., 9876543210)
                return /^[6-9]\d{9}$/.test(v);
            },
            message: (props: { value: any; }) => `${props.value} is not a valid mobile number! Must be 10 digits starting with 6-9.`
        }
    },
    password: { type: String, required: true },
    name: { type: String, required: true },
    fatherName: { type: String, required: true },
    email: {
        type: String,
        required: false, // Change to true if email is mandatory
        validate: {
            validator: function(v: string | null) {
                // If email is not provided and not required, skip validation
                if (!v) return true;
                // Standard email regex
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: (props: { value: any; }) => `${props.value} is not a valid email address!`
        }
    },
    occupation: { type: String },
    role: { type: String, enum: ['member', 'admin', 'superadmin'], default: 'member' },
    verified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    membershipDate: { type: Date }, // Optional field to track membership date
    profileUrl: { type: String } // Optional field for profile picture URL
});

export default mongoose.model<IUser>('User', userSchema);