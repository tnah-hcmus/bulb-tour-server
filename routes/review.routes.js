const express = require("express");
const router = express.Router();
const authorize = require("middleware/authorize");
const reviewController = require("controllers/review/review.controller");

router
  .route("/pictures")
  .post(
    authorize(),
    reviewController.updatePicturesSchema,
    reviewController.updatePictures
  );
router
  .route("/single/:id")
  .get(reviewController.getById)
  .put(authorize(), reviewController.updateSchema, reviewController.update)
  .delete(authorize(), reviewController.delete);
router
  .route("/")
  .get(
    reviewController.getByLocationId,
    authorize(),
    reviewController.getByUserId
  )
  .post(authorize(), reviewController.createSchema, reviewController.create);
module.exports = router;
