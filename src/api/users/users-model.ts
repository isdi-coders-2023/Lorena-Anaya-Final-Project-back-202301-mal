import mongoose, { Schema } from 'mongoose';
import { Translation } from '../translations/translations-model';

export interface User {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  languages: string;
  password: string;
  role: 'admin' | 'translator';
  translations: Translation[];
}

const userSchema = new Schema<User>({
  email: String,
  firstName: String,
  lastName: String,
  phone: String,
  languages: String,
  password: String,
  role: String,
  translations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Translation' }],
});

export const UserModel = mongoose.model<User>('User', userSchema, 'users');
