import mongoose, { Schema } from 'mongoose';

export interface User {
  email: string;
  firstName: string;
  lastName: string;
  phone: number;
  languages: string;
  password: string;
  role: 'admin' | 'translator';
}

const userSchema = new Schema<User>({
  email: String,
  firstName: String,
  lastName: String,
  phone: Number,
  languages: String,
  password: String,
  role: String,
});

export const UserModel = mongoose.model<User>('User', userSchema, 'users');
