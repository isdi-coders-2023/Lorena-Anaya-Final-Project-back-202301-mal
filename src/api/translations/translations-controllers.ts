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
        .upload(fileName, fileBuffer, { contentType: 'application/pdf' });
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
      res.json({ translation: { translation } });
    }
  } catch (err) {
    next(err);
  }
};

export const updateTranslationUploadController: RequestHandler<
  { id: string },
  { msg: string; translation: Translation },
  { translatedDoc: Buffer }
> = async (req, res, next) => {
  const { id } = req.params;
  const fileBuffer = req.file?.buffer;

  try {
    if (fileBuffer !== undefined) {
      const fileName = `${id}.pdf`;
      const { error } = await supabase.storage
        .from(PROFILE_BUCKET_NAME)
        .upload(fileName, fileBuffer, { contentType: 'application/pdf' });

      if (error === null) {
        const { data } = supabase.storage
          .from(PROFILE_BUCKET_NAME)
          .getPublicUrl(fileName);
        const translationToUpdate = await TranslationModel.findOne({
          _id: id,
        }).exec();
        if (translationToUpdate === null) {
          throw new CustomHTTPError(404, 'Translation not found');
        }

        translationToUpdate.translatedDoc = data.publicUrl;
        const updatedTranslation = await translationToUpdate.save();

        return res.status(200).json({
          msg: 'Translation updated!',
          translation: updatedTranslation,
        });
      }
    }
  } catch (err) {
    next(err);
  }
};

export const updateTranslationStatusController: RequestHandler = async (
  req,
  res,
  next,
) => {
  const { id } = req.params;
  const filter = { _id: id };
  const update = { $set: { status: req.body.status } };

  try {
    if (!req.body.status) {
      throw new CustomHTTPError(400, 'Status is required');
    }

    const dbRes = await TranslationModel.updateOne(filter, update).exec();

    if (dbRes.matchedCount === 0) {
      throw new CustomHTTPError(404, 'Translation does not exist');
    }

    if (dbRes.modifiedCount === 1) {
      const updatedTranslation = await TranslationModel.findById(id).exec();
      return res.json(updatedTranslation);
    }
  } catch (err) {
    next(err);
  }
};

export const getTranslationsController: RequestHandler<
  unknown,
  unknown,
  Translation
> = async (_req, res, next) => {
  try {
    const allTranslations = await TranslationModel.find({}).exec();
    res.json({ adminTranslations: allTranslations });
  } catch (error) {
    next(error);
  }
};

export const deleteTranslationByIdController: RequestHandler<
  { id: string },
  { msg: string; translation: Translation },
  unknown,
  unknown,
  { id: string }
> = async (req, res, next) => {
  const { id } = req.params;

  try {
    const translation = await TranslationModel.findById({ _id: id }).exec();

    if (translation === null) {
      throw new CustomHTTPError(404, 'This translation does not exist');
    }

    await TranslationModel.deleteOne({ _id: translation._id }).exec();

    res.json({
      msg: 'The translation has been deleted',
      translation,
    });
  } catch (error) {
    next(error);
  }
};
