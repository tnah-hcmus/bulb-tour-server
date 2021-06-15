const express = require("express");
const router = express.Router();
const authorize = require("middleware/authorize");
const Role = require("helper/role");
const locationController = require("controllers/location/location.controller");

router.route("/search")
      .get(authorize(), locationController.searchByNameSchema, locationController.searchByName)
      .post(authorize(), locationController.searchByNameSchema, locationController.searchByName);
router
  .route("/single/:id")
  .get(authorize(), locationController.getById)
  .put(
    authorize(Role.Admin),
    locationController.updateSchema,
    locationController.update
  )
  .delete(authorize(Role.Admin), locationController.delete);
router
  .route("/")
  .get(authorize(), locationController.getNearbySchema, locationController.getNearby)
  .post(
    authorize(Role.Admin),
    locationController.createSchema,
    locationController.create
  );

module.exports = router;
