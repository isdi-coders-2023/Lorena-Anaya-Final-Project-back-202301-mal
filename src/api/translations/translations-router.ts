import express from 'express';
import {
  createTranslationController,
  deleteTranslationByIdController,
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

TranslationsRouter.route('/').get(getTranslationsController);

TranslationsRouter.route('/:id')
  .get(getTranslationByIdController)
  .patch(upload.single('translatedDoc'), updateTranslationUploadController)
  .delete(deleteTranslationByIdController);

TranslationsRouter.route('/status/:id/').patch(
  updateTranslationStatusController,
);
