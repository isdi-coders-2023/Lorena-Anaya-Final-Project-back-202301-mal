import { NextFunction, Request, Response } from 'express';
import { UserModel } from '../users/users-model.js';
import {
  loginController,
  registerController,
} from '../auth/auth-controllers.js';
import { encryptPassword, generateJWTToken } from './auth-utils.js';
import dotenv from 'dotenv';
import { CustomHTTPError } from '../../utils/custom-http-error.js';
import { RegisterRequest } from '../../types/auth-models.js';
import mongoose from 'mongoose';
dotenv.config();

const newUser: RegisterRequest = {
  email: 'mock@email.com',
  password: encryptPassword('mockedPassword'),
  firstName: 'mock',
  lastName: 'user',
  languages: 'Chinese',
  phone: '436786543',
  role: 'translator',
};

const request = {
  body: {
    email: 'mock@email.com',
    password: 'mockedPassword',
  },
} as Partial<Request>;

const request2 = {
  body: {
    email: 'mock@email.com',
    password: 'mockedPassword',
    firstName: 'mock',
    lastName: 'user',
    languages: 'Chinese',
    phone: '436786543',
    role: 'translator',
  },
} as Partial<Request>;
const response = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
} as Partial<Response>;

const next = jest.fn();

const OLD_ENV = process.env;
beforeEach(() => {
  jest.resetModules();
  process.env = { ...OLD_ENV };
});
afterAll(() => {
  process.env = OLD_ENV;
});
afterEach(() => {
  jest.resetModules();
});

// REGISTER
describe('Given a register controller', () => {
  UserModel.findOne = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(null),
  });
  test('When the password encryption algorithm environment variable does not exist, then the response should be an error', async () => {
    delete process.env.PASSWORD_ENCRYPTION_ALGORITHM;
    await registerController(request as Request, response as Response, next);
    expect(next).toHaveBeenCalled();
  });

  test('When the password encryption key environment variable does not exist, then the response should be an error', async () => {
    delete process.env.PASSWORD_ENCRYPTION_KEY;
    await registerController(
      request as Request,
      response as Response,
      next as NextFunction,
    );
    expect(next).toHaveBeenCalled();
  });

  test('When the user tries to register, then the new user should be created on the database', async () => {
    UserModel.create = jest.fn();
    await registerController(
      request2 as Request,
      response as Response,
      jest.fn(),
    );
    expect(response.status).toHaveBeenCalledWith(201);
    expect(UserModel.create).toHaveBeenCalledWith(newUser);
  });

  test('when the user tries to register with an existing account, then an error message shold be shown', async () => {
    UserModel.findOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(1),
    }));

    const next = jest.fn();

    const expectedError = new CustomHTTPError(
      409,
      'Error, that user is already registered.',
    );

    await registerController(request as Request, response as Response, next);

    expect(next).toHaveBeenCalledWith(expectedError);
  });
});

const mockedExistingUser = {
  _id: new mongoose.Types.ObjectId('123456789123456789123456'),
  email: request.body.email,
  password: encryptPassword(request.body.password),
  firstName: 'Ana',
  lastName: 'Diaz',
  phone: '678564768',
  languages: 'French',
  role: 'translator',
  translations: [],
};

// LOGIN
describe('Given a login controller', () => {
  test('When the jwt secret environment variable does not exist, then an error should be thrown and passed on', async () => {
    delete process.env.JWT_SECRET;

    UserModel.findOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(mockedExistingUser),
    }));

    await loginController(request as Request, response as Response, next);

    expect(next).toHaveBeenCalled();
  });
  test('when the user tries to login with an non existing account, then an error message shold be shown', async () => {
    UserModel.findOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(null),
    }));

    const next = jest.fn();

    const expectedError = new CustomHTTPError(
      404,
      'Your password is invalid or this account does not exist.',
    );

    await loginController(request as Request, response as Response, next);

    expect(next).toHaveBeenCalledWith(expectedError);
  });

  test('When the user exists, then it should return the access token', async () => {
    UserModel.findOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockedExistingUser),
    });

    await loginController(request as Request, response as Response, next);

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({
      accessToken: generateJWTToken(mockedExistingUser._id.toString()),
      id: '123456789123456789123456',
    });
  });
});
