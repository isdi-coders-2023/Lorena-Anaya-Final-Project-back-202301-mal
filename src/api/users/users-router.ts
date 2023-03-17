import express from 'express';
import { getUserTranslationsController } from './users-controller.js';

export const UsersRouter = express.Router();

UsersRouter.route('/:id/translations').get(getUserTranslationsController);
