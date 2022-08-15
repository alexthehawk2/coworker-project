const Joi = require("joi");

module.exports.joiCoworkerSchema = Joi.object({
  name: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required().min(0),
  imageUrl: Joi.string()
    .uri({
      scheme: [/https/],
    })
    .required()
    .messages({
      "string.uriCustomScheme":
        "{{#label}} must be a valid url starting with https://",
    }),
});
