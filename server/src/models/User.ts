import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  mobile: string;
  password: string;
  name: string;
  fatherName: string;
  email?: string;
  occupation?: string;
  role?: 'member' | 'admin' | 'superadmin';
}

const userSchema: Schema<IUser> = new Schema({
  mobile: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  fatherName: { type: String, required: true },
  email: { type: String, unique: true },
  occupation: { type: String },
  role: { type: String, enum: ['member', 'admin', 'superadmin'], default: 'member' }
});

export default mongoose.model<IUser>('User', userSchema);