import { Joi } from 'express-validation';

import JoiPhoneNumber from 'joi-phone-number';

const myCustomJoi = Joi.extend(JoiPhoneNumber);

export const authValidation = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: myCustomJoi
      .string()
      .phoneNumber({
        defaultCountry: 'ES',
        format: 'international',
        strict: true,
      })
      .required(),

    languages: Joi.string().required(),
    role: Joi.string().required(),
  }),
};
