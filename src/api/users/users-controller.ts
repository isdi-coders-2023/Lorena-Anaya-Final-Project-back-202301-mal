import { RequestHandler } from 'express';
import {
  Translation,
  TranslationModel,
} from '../translations/translations-model.js';
import { User, UserModel } from './users-model.js';

export const getUserTranslationsController: RequestHandler<
  { id: string },
  unknown,
  Translation
> = async (req, res, next) => {
  const { id } = req.params;
  try {
    const foundTranslations = await UserModel.findById({ _id: id })
      .populate({ path: 'translations', model: TranslationModel })
      .exec();
    res.json({ translations: foundTranslations?.translations });
  } catch (err) {
    next(err);
  }
};

export const getUsersController: RequestHandler<
  unknown,
  unknown,
  User
> = async (_req, res, next) => {
  try {
    const foundUsers = await UserModel.find({}).exec();
    res.json(foundUsers);
  } catch (error) {
    next(error);
  }
};
