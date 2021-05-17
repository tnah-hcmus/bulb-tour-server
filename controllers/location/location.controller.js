const locationHelper = require("./location.service");
const Joi = require("joi");
const validateRequest = require("middleware/validate-request");
const Role = require("helper/role");

module.exports = {
  getNearbySchema,
  getNearby,
  getById,
  createSchema,
  create,
  updateSchema,
  update,
  delete: _delete,
};

function getNearbySchema(req, res, next) {
  const schema = Joi.object({
    lat: Joi.string().required(),
    long: Joi.string().required()
  });
  validateRequest(req, next, schema);
}

function getNearby(req, res, next) {
  if (!req.user.id && req.user.role !== Role.Admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  locationHelper.getNearby({})
      .then(locations => res.json(locations))
      .catch(next);
}

function getById(req, res, next) {
  // users can get their own location and admins can get any location
  locationHelper
    .getByLocationId(req.params.id)
    .then((location) => {
      if (location.userId !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      return location ? res.json(location) : res.sendStatus(404);
    })
    .catch(next);
}
function createSchema(req, res, next) {
  const schema = Joi.object({
    name: Joi.string().required(),
    address: Joi.string().required(),
    lat: Joi.string().required(),
    long: Joi.string().required(),
    type: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function create(req, res, next) {
  locationHelper
    .create(req.body)
    .then((location) => res.json(location))
    .catch(next);
}

function updateSchema(req, res, next) {
  const schemaRules = {
    rating: Joi.number().empty(/.*/),
    ratingNumber: Joi.string().empty(/.*/),
  };

  // only admins can update specified field
  if (req.user.role === Role.Admin) {
    //schemaRules.role = Joi.string().valid(Role.Admin, Role.User).empty('');
  }

  const schema = Joi.object(schemaRules);
  validateRequest(req, next, schema);
}

function update(req, res, next) {
  //admins can update any location, maybe moderator in future so this code still here although i except it through authorize() middleware
  if (req.user.role !== Role.Admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  locationHelper
    .update(req.params.id, req.body)
    .then((location) => res.json(location))
    .catch(next);
}

function _delete(req, res, next) {
  //admins can update any location
  if (req.user.role !== Role.Admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  locationHelper
    .delete(req.params.id)
    .then(() => res.json({ message: "Location deleted successfully" }))
    .catch(next);
}
