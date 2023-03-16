import { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'express-validation';
import { CustomHTTPError } from './custom-http-error.js';

export const appErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.log('Entra dentro del errorhandler');

  if (err instanceof ValidationError) {
    console.log('Entra dentro de validation error');
    return res
      .status(err.statusCode)
      .json({ msg: err.details.body?.[0].message ?? err.message });
  }

  if (err instanceof CustomHTTPError) {
    console.log('ENTRA EN EL CUSTOM ERROR');
    return res.status(err.httpCode).json(err.toBodyJSON());
  }

  return res.status(500).json({ msg: err.message });
};
