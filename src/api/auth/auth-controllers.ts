import { RequestHandler } from 'express';
import log from '../../logger.js';
import { AuthRequest, LoginResponse } from '../../types/types-model.js';
import { User, UserModel } from '../users/users-model.js';

import { encryptPassword, generateJWTToken } from './auth-utils.js';

export const registerController: RequestHandler<
  unknown,
  unknown,
  User
> = async (req, res, next) => {
  const { email, password, firstName, lastName, phone, languages, role } =
    req.body;
  const existingUser = await UserModel.findOne({ email }).exec();
  if (existingUser !== null) {
    return res.status(409).json({ msg: 'That email is already registered' });
  }

  try {
    const newUser = {
      email,
      password: encryptPassword(password),
      role,
      languages,
      firstName,
      lastName,
      phone,
    };

    await UserModel.create(newUser);
    return res.status(201).json({ msg: 'New user successfully created!' });
  } catch (err) {
    next(err);
  }
};

export const loginController: RequestHandler<
  unknown,
  LoginResponse | { msg: string },
  AuthRequest
> = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user: AuthRequest = {
      email,
      password: encryptPassword(password),
    };

    const existingUser = await UserModel.findOne(user).exec();

    if (existingUser === null) {
      log.debug('User not found');
      return res.status(404).json({ msg: 'User not found' });
    }

    const userToken = generateJWTToken(email);
    log.debug('Token generated');
    return res.status(201).json({ accessToken: userToken });
  } catch (err) {
    next(err);
  }
};
