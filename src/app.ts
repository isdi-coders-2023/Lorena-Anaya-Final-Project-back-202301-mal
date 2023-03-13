import express from 'express';

import cors from 'cors';

const app = express();

app.get('/', (_req, res) => {
  res.json('Hello world');
});

app.use(cors());
app.use(express.json());

export default app;
