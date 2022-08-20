const Joi = require('joi')

module.exports.joiReviewSchema = Joi.object({
    review:Joi.object({
        body: Joi.string().min(5).required(),
        rating:Joi.number().min(1).max(5).required()
    }).required()
    
})