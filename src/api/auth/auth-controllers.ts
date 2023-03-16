import { RequestHandler } from 'express';
import { CustomHTTPError } from '../../utils/custom-http-error.js';
import { AuthRequest, LoginResponse } from '../../types/auth-models.js';
import { User, UserModel } from '../users/users-model.js';

import { encryptPassword, generateJWTToken } from './auth-utils.js';
import log from '../../logger.js';

export const registerController: RequestHandler<
  unknown,
  unknown,
  User
> = async (req, res, next) => {
  const { email, password, firstName, lastName, phone, languages, role } =
    req.body;

  try {
    const existingUser = await UserModel.findOne({ email }).exec();
    if (existingUser !== null) {
      log.error('Email already registered!');
      throw new CustomHTTPError(409, 'Error, that user is already registered.');
    }

    const newUser: User = {
      email,
      password: encryptPassword(password),
      role,
      languages,
      firstName,
      lastName,
      phone,
    };

    await UserModel.create(newUser);
    log.info('New user created.');
    return res.status(201).json({ msg: ' Succesfully registered!' });
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
      throw new CustomHTTPError(
        404,
        'Your password is invalid or this account does not exist.',
      );
    }

    const userToken = generateJWTToken(email);
    return res.status(201).json({ accessToken: userToken });
  } catch (err) {
    next(err);
  }
};
