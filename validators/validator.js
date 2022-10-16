const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value)
          return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});

const Joi = BaseJoi.extend(extension);

module.exports.joiCoworkerSchema = Joi.object({
  name: Joi.string().required().escapeHTML(),
  city: Joi.string().required().escapeHTML(),
  state: Joi.string().required().escapeHTML(),
  description: Joi.string().required().escapeHTML(),
  price: Joi.number().required().min(0),
  deleteImages: Joi.array(),
});

module.exports.joiReviewSchema = Joi.object({
  review: Joi.object({
    body: Joi.string().min(5).required().escapeHTML(),
    rating: Joi.number().min(1).max(5).required(),
  }).required(),
});
