import express from 'express';

import cors from 'cors';
import { authRouter } from './api/auth/auth-router.js';
import { errorHandler } from './utils/error-handler.js';

const app = express();

app.get('/', (_req, res) => {
  res.json('Hello world');
});

app.use(cors({ origin: ['http://localhost:4000/'] }));
app.use(express.json());

app.disable('x-powered-by');

app.use('/auth', authRouter);

app.use(errorHandler);

export default app;
