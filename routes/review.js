const express = require('express')
const coWorker = require('../models/coWorker')
const Review = require('../models/review')
const AppError = require('../utils/AppError')
const asyncErrorWrapper = require('../utils/asyncErrorWrapper')
const { joiReviewSchema } = require('../validators/validator')
const router = express.Router({mergeParams:true})
//validator functions
const reviewValidation = (req, res, next) => {
    const validationResult = joiReviewSchema.validate(req.body)
    if (validationResult.error) {
        throw new AppError(`${validationResult.error.details[0].message}`, 400);
    } else {
        next();
    }
}
router.post('/', reviewValidation, asyncErrorWrapper(async (req, res) => {
    const space = await coWorker.findById(req.params.id)
    let { review } = req.body
    review = new Review(review)
    space.reviews.push(review)
    await space.save()
    await review.save()
    req.flash('success','Review Added succesfully')
    res.redirect(`/spaces/${req.params.id}`)
}))
router.delete('/:reviewId', async (req, res) => {
    await coWorker.findByIdAndUpdate(req.params.id, { $pull: { reviews: req.params.reviewId } })
    await Review.findByIdAndDelete(req.params.id)
    res.redirect(`/spaces/${req.params.id}`)
})

module.exports = router