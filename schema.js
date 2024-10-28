const Joi = require('joi');
const passwordStrengthValidator = require('./utils/passwordStrength');

module.exports.taskSchema = Joi.object({
    title: Joi.string().required().messages({
        "string.empty": "Title is required",
    }),
    priority: Joi.string()
        .valid('HIGH-PRIORITY', 'MODERATE-PRIORITY', 'LOW-PRIORITY')
        .required()
        .messages({
            "any.only": "Priority must be one of HIGH-PRIORITY, MODERATE-PRIORITY, or LOW-PRIORITY",
            "string.empty": "Priority is required",
        }),
    checkLists: Joi.array().items(
        Joi.object({
            tag: Joi.string().required().messages({
                "string.empty": "Checklist item tag is required",
            }),
            isDone: Joi.boolean().default(false)
        })
    ).min(1).required().messages({
        "array.min": "At least one checklist item is required",
    }),
    assignee: Joi.string().allow(null, '').messages({
        "string.empty": "Assignee cannot be empty",
    }),
    date: Joi.date().allow(null, '').optional().messages({
        "date.base": "Invalid date format",
    })
});


module.exports.userSchema = Joi.object({
    name: Joi.string().required().messages({
        'any.required': 'Name is required',
    }),
    email: Joi.string().email().required().messages({
        'any.required': 'Email is required',
        'string.email': 'Email must be a valid email',
    }),
    password: Joi.string()
        .custom(passwordStrengthValidator, 'Password Strength Validation')
        .required().messages({
            'any.required': 'Password is required',
        }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.required': 'Confirm Password is required',
        'any.only': 'Passwords must match',
    }),
});




