import mongoose, { Schema } from 'mongoose';

export interface Translation {
  bookingRef: string;
  dueDate: Date;
  languageFrom: string;
  languageTo: string;
  words: number;
  status: string;
  toTranslateDoc: string;
  translatedDoc: string;
  translator: string;
}

const translationSchema = new Schema<Translation>({
  bookingRef: String,
  dueDate: Date,
  languageFrom: String,
  languageTo: String,
  words: Number,
  status: String,
  toTranslateDoc: String,
  translatedDoc: String,
  translator: String,
});

export const TranslationModel = mongoose.model<Translation>(
  'Translation',
  translationSchema,
  'translations',
);
