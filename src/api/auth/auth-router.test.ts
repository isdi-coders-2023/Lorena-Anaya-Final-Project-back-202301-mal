import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import connectDB from '../../database/connection.js';
import { User } from '../users/users-model';
import app from '../../app.js';
import log from '../../logger.js';

describe('Given an app with auth-router', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUrl = mongoServer.getUri();
    await connectDB(mongoUrl);
  });

  afterAll(async () => {
    await mongoServer.stop();
    await mongoose.connection.close();
  });

  describe('When a user wants to register', () => {
    const user: User = {
      email: 'user@email.com',
      password: 'password',
      firstName: 'Mock',
      lastName: 'Perez',
      phone: '699954493',
      languages: 'English, Spanish',
      role: 'translator',
    };

    test('With valid inputs, then it should be registered', async () => {
      await request(app).post('/auth/register').send(user).expect(201);
      log.info(user);
    });

    test('With an invalid email, then it should not be able to register', async () => {
      const invalidEmailUser: User = {
        email: 'usemail.com',
        password: 'password',
        firstName: 'Mock',
        lastName: 'Perez',
        phone: '699954493',
        languages: 'English, Spanish',
        role: 'translator',
      };
      await request(app)
        .post('/auth/register')
        .send(invalidEmailUser)
        .expect(400);
    });

    test('With an invalid phone number, then it should not be able to register', async () => {
      const invalidPhoneUser: User = {
        email: 'user2@gmail.com',
        password: 'password',
        firstName: 'Mock',
        lastName: 'Perez',
        phone: '69',
        languages: 'English, Spanish',
        role: 'translator',
      };
      await request(app)
        .post('/auth/register')
        .send(invalidPhoneUser)
        .expect(400);
    });

    test('When the email is already in use, then it should not be able to register', async () => {
      await request(app).post('/auth/register').send(user).expect(409);
    });

    test('When the password encryption algorithm environment variable is not defined, then the response should be an error', async () => {
      delete process.env.PASSWORD_ENCRYPTION_ALGORITHM;
      const user: User = {
        email: 'user334@email.com',
        password: 'password',
        firstName: 'Mock',
        lastName: 'Perez',
        phone: '699954493',
        languages: 'English, Spanish',
        role: 'translator',
      };
      await request(app).post('/auth/register').send(user).expect(500);
    });
  });
});
