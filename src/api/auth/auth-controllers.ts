import { RequestHandler } from 'express';
import { User, UserModel } from '../users/users-model.js';

import { encryptPassword } from './auth-utils.js';

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
