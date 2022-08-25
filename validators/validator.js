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

module.exports.joiReviewSchema = Joi.object({
  review:Joi.object({
      body: Joi.string().min(5).required(),
      rating:Joi.number().min(1).max(5).required()
  }).required()
  
})