import express from 'express';
import {
  getUserByIdController,
  getUsersController,
  getUserTranslationsController,
} from './users-controller.js';

export const UsersRouter = express.Router();

UsersRouter.route('/:id/translations').get(getUserTranslationsController);
UsersRouter.route('/all').get(getUsersController);
UsersRouter.route('/:id/name').get(getUserByIdController);
