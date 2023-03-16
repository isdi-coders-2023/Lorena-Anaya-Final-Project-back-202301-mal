import { User } from '../api/users/users-model.js';

export type AuthRequest = Pick<User, 'email' | 'password'>;

export interface LoginResponse {
  accessToken: string;
}

export interface UserQueryId {
  _id: string;
}
