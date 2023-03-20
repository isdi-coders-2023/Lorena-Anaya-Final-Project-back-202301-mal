import { NextFunction, Request, Response } from 'express';
import { createTranslationController } from './translations-controllers';
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
      bookingRef: 'tre',
      dueDate: '2023-05-06',
      languageFrom: 'spanish',
      languageTo: 'english',
      words: 3723872,
      status: 'Pending',
      translator: 'pepe',
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
    await createTranslationController(
      request as Request,
      response as Response,
      next as NextFunction,
    );
    await expect(response.status).toHaveBeenCalledWith(201);
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
