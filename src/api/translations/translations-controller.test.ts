import { NextFunction, Request, Response } from 'express';
import { CustomHTTPError } from '../../utils/custom-http-error';
import { UserModel } from '../users/users-model';
import {
  createTranslationController,
  getTranslationByIdController,
} from './translations-controllers';
import { TranslationModel } from './translations-model';

jest.mock('@supabase/supabase-js', () => {
  const data = {
    publicUrl: 'https://example.com/photo.png',
  };
  return {
    createClient: jest.fn().mockImplementation(() => ({
      storage: {
        from: jest.fn().mockReturnValue({
          upload: jest.fn().mockResolvedValue({
            error: null,
            data: {
              ...data,
            },
          }),
          getPublicUrl: jest.fn().mockReturnValue({
            error: null,
            data: {
              ...data,
            },
          }),
        }),
      },
    })),
  };
});

describe('When a request to create a translation is made', () => {
  const next = jest.fn();
  const request = {
    body: {
      translation: {
        bookingRef: 'tre',
        dueDate: '2023-05-06',
        languageFrom: 'spanish',
        languageTo: 'english',
        words: 3723872,
        status: 'Pending',
        translator: 'pepe',
      },
    },
    file: { buffer: Buffer.from('mockedBuffer') },
  } as Partial<Request>;

  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as Partial<Response>;

  const mockPost = { _id: 'post_id' };
  TranslationModel.create = jest.fn().mockResolvedValue(mockPost);

  test('Then the translation should be created', async () => {
    UserModel.findOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(1),
    }));

    UserModel.updateOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(1),
    }));

    await createTranslationController(
      request as Request,
      response as Response,
      next as NextFunction,
    );
    await expect(response.status).toHaveBeenCalledWith(201);
  });

  test('But the user to update is not updated, then it should throw an error', async () => {
    UserModel.findOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(1),
    }));

    UserModel.updateOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
    }));

    const expectedError2 = new CustomHTTPError(
      404,
      'User to update not updated',
    );

    await createTranslationController(
      request as Request,
      response as Response,
      next as NextFunction,
    );
    await expect(next).toHaveBeenCalledWith(expectedError2);
  });

  test('But the user to update is not found, then it should throw an error', async () => {
    UserModel.findOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(null),
    }));

    const expectedError = new CustomHTTPError(404, 'User to update not found');

    await createTranslationController(
      request as Request,
      response as Response,
      next as NextFunction,
    );
    await expect(next).toHaveBeenCalledWith(expectedError);
  });

  test('But there is an error, then an error should be thrown', async () => {
    TranslationModel.create = jest
      .fn()
      .mockRejectedValueOnce(new Error('test error'));
    await createTranslationController(
      request as Request,
      response as Response,
      next,
    );
    await expect(next).toHaveBeenCalled();
  });
});

describe('Given a getTranslationByIdController from translations controller', () => {
  const request = {
    params: { id: 'mockId' },
    body: {
      translation: {
        bookingRef: 'tre',
        dueDate: '2023-05-06',
        languageFrom: 'spanish',
        languageTo: 'english',
        words: 3723872,
        status: 'Pending',
        translator: 'pepe',
      },
    },
  } as Partial<Request>;
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as Partial<Response>;

  TranslationModel.findById = jest.fn().mockImplementation(() => ({
    exec: jest.fn().mockResolvedValue(request.body),
  }));

  const next = jest.fn();

  test('when the user exists then it should respond with a translation', async () => {
    await getTranslationByIdController(
      request as Request,
      response as Response,
      jest.fn(),
    );
    expect(response.json).toHaveBeenCalledWith({
      translation: {
        translation: {
          translation: {
            bookingRef: 'tre',
            dueDate: '2023-05-06',
            languageFrom: 'spanish',
            languageTo: 'english',
            status: 'Pending',
            translator: 'pepe',
            words: 3723872,
          },
        },
      },
    });
  });
  test('when the user does not exists then it should throw a custom error', async () => {
    TranslationModel.findById = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(null),
    }));

    const expectedError = new CustomHTTPError(
      404,
      'The translation does not exists',
    );

    await getTranslationByIdController(
      request as Request,
      response as Response,
      next as NextFunction,
    );
    await expect(next).toHaveBeenCalledWith(expectedError);
  });
});
