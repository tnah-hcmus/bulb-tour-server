const express = require("express");
const router = express.Router();
const authorize = require("middleware/authorize");
const tourController = require("controllers/tour/tour.controller");

router
  .route("/single/:id")
  .get(authorize(), tourController.getById) //get tour by id, must be owner
  .put(authorize(), tourController.updateSchema, tourController.update) //update tour by id, must be owner
  .delete(authorize(), tourController.delete); //cancel tour by id, must be owner; delete tour if admin
router
  .route("/generate")
  .post(
    authorize(),
    tourController.generateDraftTourSchema,
    tourController.generateDraftTour
  );
router
  .route("/")
  .get(authorize(), tourController.getByUserId) //get all tour create by user
  .post(authorize(), tourController.createSchema, tourController.create); //add new tour
module.exports = router;
