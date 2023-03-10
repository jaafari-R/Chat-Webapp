import Joi, { ObjectSchema } from 'joi';

const emailSchema: ObjectSchema = Joi.object().keys({
    email: Joi.string().email().required().messages({
        'string.base': 'Field must be a valid email',
        'string.required': 'Email field is required',
        'string.email': 'Email must be valid'
    })
});

const passwordSchema: ObjectSchema = Joi.object().keys({
    password: Joi.string().required().min(4).max(8).messages({
        'string.base': 'Password must be of type string',
        'string.min': 'Invalid password',
        'string.max': 'Invalid password',
        'string.empty': 'Password is a required field'
    }),
    confirmPassword: Joi.string().required().valid(Joi.ref('passsword')).messages({
        'any.only': 'Password should match',
        'any.required': 'Confirm password is a required field'
    })
});

export { emailSchema, passwordSchema };
