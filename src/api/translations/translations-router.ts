import express from 'express';
import {
  createTranslationController,
  getTranslationByIdController,
  getTranslationsController,
  updateTranslationStatusController,
  updateTranslationUploadController,
} from './translations-controllers.js';
import { upload } from './translations-upload-middleware.js';

export const TranslationsRouter = express.Router();

TranslationsRouter.route('/create').post(
  upload.single('toTranslateDoc'),
  createTranslationController,
);

TranslationsRouter.route('/all').get(getTranslationsController);

TranslationsRouter.route('/:id')
  .get(getTranslationByIdController)
  .patch(upload.single('translatedDoc'), updateTranslationUploadController);

TranslationsRouter.route('/status/:id/').patch(
  updateTranslationStatusController,
);
