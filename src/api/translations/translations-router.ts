import express from 'express';
import { createTranslationController } from './translations-controllers.js';
import { upload } from './translations-upload-middleware.js';

export const TranslationsRouter = express.Router();

TranslationsRouter.route('/create').post(
  upload.single('toTranslateDoc'),
  createTranslationController,
);
