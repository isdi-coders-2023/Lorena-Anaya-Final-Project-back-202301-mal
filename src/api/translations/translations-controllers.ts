import { RequestHandler } from 'express';
import {
  PROFILE_BUCKET_NAME,
  supabase,
} from '../../database/supabase-client.js';
import { CustomHTTPError } from '../../utils/custom-http-error.js';
import { UserModel } from '../users/users-model.js';
import { Translation, TranslationModel } from './translations-model.js';

export const createTranslationController: RequestHandler<
  unknown,
  { msg: string; translation: Translation },
  Translation
> = async (req, res, next) => {
  const { bookingRef, languageFrom, languageTo, dueDate, translator, words } =
    req.body;
  const fileBuffer = req.file?.buffer;
  try {
    if (fileBuffer !== undefined) {
      const fileName = `${bookingRef}.pdf`;
      const { error } = await supabase.storage
        .from(PROFILE_BUCKET_NAME)
        .upload(fileName, fileBuffer);
      if (error === null) {
        const { data } = supabase.storage
          .from(PROFILE_BUCKET_NAME)
          .getPublicUrl(fileName);
        const createTranslation: Translation = {
          bookingRef,
          status: 'Pending',
          languageFrom,
          languageTo,
          dueDate,
          translator,
          toTranslateDoc: data.publicUrl,
          translatedDoc: '',
          words,
        };
        const newTranslation = await TranslationModel.create(createTranslation);
        const userToUpdate = await UserModel.findOne({
          firstName: translator,
        }).exec();
        if (userToUpdate === null) {
          throw new CustomHTTPError(404, 'User to update not found');
        }

        const translationRes = await UserModel.updateOne(
          { firstName: userToUpdate.firstName },
          { $push: { translations: newTranslation._id } },
        ).exec();

        if (translationRes.modifiedCount === 0) {
          throw new CustomHTTPError(404, 'User to update not updated');
        }

        return res
          .status(201)
          .json({ msg: 'New post created!', translation: newTranslation });
      }
    }
  } catch (err) {
    next(err);
  }
};

export const getTranslationByIdController: RequestHandler = async (
  req,
  res,
  next,
) => {
  const { id } = req.params;
  try {
    const translation = await TranslationModel.findById(id).exec();
    if (translation === null) {
      throw new CustomHTTPError(404, 'The translation does not exists');
    } else {
      res.json(translation);
    }
  } catch (err) {
    next(err);
  }
};
