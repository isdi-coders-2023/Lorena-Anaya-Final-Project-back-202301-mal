import express from 'express';
import {
  createTranslationController,
  getTranslationByIdController,
} from './translations-controllers.js';
import { upload } from './translations-upload-middleware.js';

export const TranslationsRouter = express.Router();

TranslationsRouter.route('/create').post(
  upload.single('toTranslateDoc'),
  createTranslationController,
);

TranslationsRouter.route('/:id').get(getTranslationByIdController);
