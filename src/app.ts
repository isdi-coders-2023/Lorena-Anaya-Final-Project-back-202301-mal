import express from 'express';

import cors from 'cors';
import { authRouter } from './api/auth/auth-router.js';
import { appErrorHandler } from './utils/error-handler.js';
import { UsersRouter } from './api/users/users-router.js';
import { TranslationsRouter } from './api/translations/translations-router.js';
import bodyParser from 'body-parser';
import { authMiddleware } from './api/auth/auth-middleware.js';

const app = express();

app.get('/', (_req, res) => {
  res.json('Hello world');
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.disable('x-powered-by');

app.use('/auth', authRouter);

app.use('/user', UsersRouter);

app.use('/translations', authMiddleware, TranslationsRouter);

app.use(appErrorHandler);

export default app;
