import express from 'express';

import cors from 'cors';

const app = express();

app.get('/', (_req, res) => {
  res.json('Hello world');
});

app.use(cors({ origin: ['http://localhost:4000/'] }));
app.use(express.json());

app.disable('x-powered-by');

export default app;
