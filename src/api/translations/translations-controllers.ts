import { RequestHandler } from 'express';
import {
  PROFILE_BUCKET_NAME,
  supabase,
} from '../../database/supabase-client.js';
import { Translation, TranslationModel } from './translations-model.js';

export const createTranslationController: RequestHandler<
  unknown,
  unknown,
  Translation
> = async (req, res, next) => {
  const {
    bookingRef,
    status,
    languageFrom,
    languageTo,
    dueDate,
    translator,
    words,
  } = req.body;
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
          status,
          languageFrom,
          languageTo,
          dueDate,
          translator,
          toTranslateDoc: data.publicUrl,
          translatedDoc: '',
          words,
        };

        await TranslationModel.create(createTranslation);
        return res.status(201).json({ msg: 'New Translation created' });
      }
    }
  } catch (err) {
    next(err);
  }
};
