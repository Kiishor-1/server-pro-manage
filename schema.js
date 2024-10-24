const Joi = require('joi');

module.exports.taskSchema = Joi.object({
    title: Joi.string().required(),
    priority: Joi.string()
        .valid('HIGH-PRIORITY', 'MODERATE-PRIORITY', 'LOW-PRIORITY')
        .required(),
    checkLists: Joi.array().items(
        Joi.object({
            tag: Joi.string().required(),
            isDone: Joi.boolean().default(false)
        })
    ).default([]),
    assignee: Joi.string().allow(null, ''),
    date: Joi.date().allow(null, '').optional()  // Allow null and empty strings for date
});
