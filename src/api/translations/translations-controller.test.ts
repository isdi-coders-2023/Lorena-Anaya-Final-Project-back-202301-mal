import { NextFunction, Request, Response } from 'express';
import { CustomHTTPError } from '../../utils/custom-http-error';
import { UserModel } from '../users/users-model';
import {
  createTranslationController,
  deleteTranslationByIdController,
  getTranslationByIdController,
  getTranslationsController,
  updateTranslationStatusController,
  updateTranslationUploadController,
} from './translations-controllers';
import { Translation, TranslationModel } from './translations-model';

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
beforeEach(() => {
  jest.clearAllMocks();
});

// CREATE TRANSLATION
describe('Given a create translation controller', () => {
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

  test('When the request is made and everything goes ok, then the translation should be created', async () => {
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

  test('When the user to update is not updated, then it should throw an error', async () => {
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

  test('When the user to update is not found, then it should throw an error', async () => {
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

  test('When there is an error, then an error should be thrown', async () => {
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

// GET TRANSLATION BY ID
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

// UPDATE STATUS CONTROLLER
describe('Given an updateTranslationStatusController function from translations controller', () => {
  const translationId = 'mockId';
  const requestBody = { status: 'Completed' };
  const request = {
    params: { id: translationId },
    body: requestBody,
  } as Partial<Request>;

  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as Partial<Response>;

  const next = jest.fn();

  test('When the translation exits and it has been modified, it should respond with the modified translation', async () => {
    TranslationModel.updateOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue({ matchedCount: 1, modifiedCount: 1 }),
    }));

    TranslationModel.findById = jest
      .fn()
      .mockResolvedValue({ id: translationId, ...requestBody });
    await updateTranslationStatusController(
      request as Request,
      response as Response,
      next,
    );

    const translationRes = { id: 'mockId', status: 'Completed' };

    expect(response.json).toHaveBeenCalledWith(translationRes);
  });

  test('when an error is thwron during execution, should call the next middleware with the thrown error', async () => {
    const error = new Error('Something went wrong!');
    TranslationModel.updateOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockRejectedValue(error),
    }));

    await updateTranslationStatusController(
      request as Request,
      response as Response,
      next,
    );

    expect(next).toHaveBeenCalled();
  });

  test('When the request body does not include a status property, it should throw a CustomHTTPError with a status of 400', async () => {
    request.body = {};

    await updateTranslationStatusController(
      request as Request,
      response as Response,
      next,
    );

    expect(next).toHaveBeenCalledWith(
      new CustomHTTPError(400, 'Status is required'),
    );
  });

  test('When the translation does no exist, it should throw a CustomHTTPError with a status of 404', async () => {
    const requestBody = { status: 'Completed' };
    const request = {
      params: { id: translationId },
      body: requestBody,
    } as Partial<Request>;

    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as Partial<Response>;

    TranslationModel.updateOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue({ matchedCount: 0, modifiedCount: 0 }),
    }));

    await updateTranslationStatusController(
      request as Request,
      response as Response,
      next,
    );
    expect(next).toHaveBeenCalledWith(
      new CustomHTTPError(404, 'Translation does not exist'),
    );
  });
});

// UPDATE DOC TRANSLATED IN TRANSLATION
describe('Given a update upload translation controller', () => {
  const next = jest.fn();
  const request = {
    params: { id: 'mockId' },
    file: { buffer: Buffer.from('mockedBuffer') },
  } as Partial<
    Request<
      { id: string },
      { msg: string; translation: Translation },
      { translatedDoc: Buffer }
    >
  >;

  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as Partial<Response>;

  test('When the request is made and everything goes ok, then the translation should be updated', async () => {
    const translationToUpdate = {
      _id: '123',
      translatedDoc: null,
      save: jest.fn().mockResolvedValue({
        _id: '123',
        translatedDoc: 'http://example.com/test.pdf',
      }),
    };
    translationToUpdate.save.mockResolvedValue({
      _id: '123',
      translatedDoc: 'http://example.com/test.pdf',
    });

    TranslationModel.findOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(translationToUpdate),
    }));
    TranslationModel.updateOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    }));

    await updateTranslationUploadController(
      request as Request<
        { id: string },
        { msg: string; translation: Translation },
        { translatedDoc: Buffer }
      >,
      response as Response,
      next as NextFunction,
    );
    await expect(response.status).toHaveBeenCalledWith(200);
  });

  test('When the translation to update is not found, then it should throw an error', async () => {
    TranslationModel.findOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(null),
    }));

    const expectedError = new CustomHTTPError(404, 'Translation not found');

    await updateTranslationUploadController(
      request as Request<
        { id: string },
        { msg: string; translation: Translation },
        { translatedDoc: Buffer }
      >,
      response as Response,
      next as NextFunction,
    );
    await expect(next).toHaveBeenCalledWith(expectedError);
  });
});

describe('Given a getTranslationsController function from translations controller', () => {
  const request = {} as Request;
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as Partial<Response>;

  const translations = [
    {
      __v: 0,
      _id: '641c50c06018ad715d2752c7',
      bookingRef: '675',
      dueDate: '2023-04-28T00:00:00.000Z',
      languageFrom: 'English',
      languageTo: 'Spanish',
      status: 'Completed',
      toTranslateDoc:
        'https://kfgqypbospvevemrysdv.supabase.co/storage/v1/object/public/translations/675.pdf',
      translatedDoc:
        'https://kfgqypbospvevemrysdv.supabase.co/storage/v1/object/public/translations/641c50c06018ad715d2752c7.pdf',
      translator: 'Aana',
      words: 524,
    },
  ];

  const translationsRes = {
    adminTranslations: [
      {
        __v: 0,
        _id: '641c50c06018ad715d2752c7',
        bookingRef: '675',
        dueDate: '2023-04-28T00:00:00.000Z',
        languageFrom: 'English',
        languageTo: 'Spanish',
        status: 'Completed',
        toTranslateDoc:
          'https://kfgqypbospvevemrysdv.supabase.co/storage/v1/object/public/translations/675.pdf',
        translatedDoc:
          'https://kfgqypbospvevemrysdv.supabase.co/storage/v1/object/public/translations/641c50c06018ad715d2752c7.pdf',
        translator: 'Aana',
        words: 524,
      },
    ],
  };
  test('when it is invoked it should return a list of translations', async () => {
    TranslationModel.find = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(translations),
    }));
    await getTranslationsController(request, response as Response, jest.fn());
    expect(response.json).toHaveBeenCalledWith(translationsRes);
  });

  test('when the database throws an error then it should response with an error', async () => {
    TranslationModel.find = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockRejectedValue(new Error('Database error')),
    }));
    const next = jest.fn();
    await getTranslationsController(request, response as Response, next);
    expect(next).toHaveBeenCalled();
  });
});

// DELETE TRANSLATION
describe('Given a controller to delete a translation by its id,', () => {
  const mockRequest = {
    params: { id: 'mockId' },
  } as Partial<Request>;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    locals: { id: 'mockUserId' },
  } as Partial<Response>;

  const next = jest.fn();

  const mockTranslation = {
    _id: '641c50c06018ad715d2752c7',
    bookingRef: '675',
    dueDate: '2023-04-28T00:00:00.000Z',
    languageFrom: 'English',
    languageTo: 'Spanish',
    words: 524,
    status: 'Completed',
    toTranslateDoc:
      'https://kfgqypbospvevemrysdv.supabase.co/storage/v1/object/public/translations/675.pdf',
    translatedDoc:
      'https://kfgqypbospvevemrysdv.supabase.co/storage/v1/object/public/translations/641c50c06018ad715d2752c7.pdf',
    translator: 'Aana',
    __v: 0,
  };

  test('when the session is deleted successfully, a message should be shown', async () => {
    TranslationModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockTranslation),
    });

    TranslationModel.deleteOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    });

    await deleteTranslationByIdController(
      mockRequest as Request<
        { id: string },
        { msg: string },
        unknown,
        unknown,
        { id: string }
      >,
      mockResponse as Response<{ msg: string }, { id: string }>,
      next,
    );

    expect(mockResponse.json).toHaveBeenCalledWith({
      msg: 'The translation has been deleted',
    });
  });

  test('when the translation does not exist, an error should be passed on', async () => {
    TranslationModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await deleteTranslationByIdController(
      mockRequest as Request<
        { id: string },
        { msg: string },
        unknown,
        unknown,
        { id: string }
      >,
      mockResponse as Response<{ msg: string }, { id: string }>,
      next,
    );

    expect(next).toHaveBeenCalled();
  });
});
