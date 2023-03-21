import { NextFunction, Request, Response } from 'express';
import { Translation } from '../translations/translations-model';
import {
  getUsersController,
  getUserTranslationsController,
} from './users-controller';
import { UserModel } from './users-model';

describe('Given a getUserTranslationsController function from users controller', () => {
  const request = {
    params: { id: 'mockId' },
  } as Request<{ id: string }, unknown, Translation>;

  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as Partial<Response>;

  const translations = {
    translations: [
      {
        bookingRef: 'TS1',
        dueDate: '28/02/2023, 11:49:36 AM',
        languageFrom: 'English',
        languageTo: 'Chinese',
        words: '1876',
        status: 'Pending',
        toTranslateDoc: 'url',
        translatedDoc: 'url2',
      },
    ],
  };

  test('when it is invoked it should return the list of translations of the user', async () => {
    UserModel.findById = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(translations),
    }));

    await getUserTranslationsController(
      request,
      response as Response,
      jest.fn(),
    );
    expect(response.json).toHaveBeenCalledWith(translations);
  });

  test('when the database throws an error then it should response with status 500', async () => {
    UserModel.findById = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockRejectedValue(new Error('Database error')),
    }));
    const next = jest.fn();

    await getUserTranslationsController(
      request,
      response as Response,
      next as NextFunction,
    );

    expect(next).toHaveBeenCalled();
  });
});

describe('Given a getUsersController function from UsersController', () => {
  const request = {} as Request;
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as Partial<Response>;

  const users = [
    {
      _id: '6415cfa3b275f174bfbe76ec',
      email: 'lorenadiaz@gmail.com',
      firstName: 'Lorena',
      lastName: 'Anaya',
      phone: '626857375',
      languages: 'Chinese, Spanish, English\n',
      password: '68684f90e1f455e56f3948385c705484',
      translations: [],
    },
  ];

  test('when it is invoked it should return a list of Users', async () => {
    UserModel.find = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(users),
    }));
    await getUsersController(request, response as Response, jest.fn());
    expect(response.json).toHaveBeenCalledWith(users);
  });

  test('when the database throws an error then it should response with an error', async () => {
    UserModel.find = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockRejectedValue(new Error('Database error')),
    }));
    const next = jest.fn();
    await getUsersController(request, response as Response, next);
    expect(next).toHaveBeenCalled();
  });
});
