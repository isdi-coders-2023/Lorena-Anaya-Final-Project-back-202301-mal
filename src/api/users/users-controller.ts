import { RequestHandler } from 'express';
import {
  Translation,
  TranslationModel,
} from '../translations/translations-model.js';
import { UserModel } from './users-model.js';

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
