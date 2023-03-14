import { NextFunction, Request, Response } from 'express';
import { UserModel } from '../users/users-model';
import { registerController } from './auth-controllers';
import { encryptPassword } from './auth-utils';
import dotenv from 'dotenv';

dotenv.config();

describe('Given a register controller', () => {
  const request = {
    body: {
      email: 'mock@email.com',
      password: 'mockedPassword',
      firstName: 'Mock',
      lastName: 'Perez',
      phone: '699954493',
      languages: 'English, Spanish',
      role: 'translator',
    },
  } as Partial<Request>;

  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as Partial<Response>;

  const newUser = {
    email: 'mock@email.com',
    password: encryptPassword('mockedPassword'),
    firstName: 'Mock',
    lastName: 'Perez',
    phone: '699954493',
    languages: 'English, Spanish',
    role: 'translator',
  };

  test('When the user tries to register, then the new user should be created on the database', async () => {
    UserModel.create = jest.fn();
    UserModel.findOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(null),
    }));
    await registerController(
      request as Request,
      response as Response,
      jest.fn(),
    );
    expect(response.status).toHaveBeenCalledWith(201);
    expect(UserModel.create).toHaveBeenCalledWith(newUser);
  });

  test('When the recevied email is already on database, then the response should be a 409 status', async () => {
    UserModel.findOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(1),
    }));
    await registerController(
      request as Request,
      response as Response,
      jest.fn(),
    );
    expect(response.status).toHaveBeenCalledWith(409);
  });

  test('When the password encryption algorithm environment variable is not defined, then the response should be an error', async () => {
    const next = jest.fn();
    UserModel.findOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(null),
    }));
    delete process.env.PASSWORD_ENCRYPTION_ALGORITHM;
    await registerController(
      request as Request,
      response as Response,
      next as NextFunction,
    );
    expect(next).toHaveBeenCalled();
  });

  test('When the password encryption key environment variable is not defined, then the response should be an error', async () => {
    const next = jest.fn();
    UserModel.findOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(null),
    }));
    process.env.PASSWORD_ENCRYPTION_ALGORITHM = 'dgdhd';
    delete process.env.PASSWORD_ENCRYPTION_KEY;
    await registerController(
      request as Request,
      response as Response,
      next as NextFunction,
    );
    expect(next).toHaveBeenCalled();
  });
});
