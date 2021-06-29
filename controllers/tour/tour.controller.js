const tourHelper = require("./tour.service");
const Joi = require("joi");
const validateRequest = require("middleware/validate-request");
const Role = require("helper/role");

module.exports = {
  getByUserId,
  getById,
  createSchema,
  create,
  updateSchema,
  update,
  delete: _delete,
  generateDraftTourSchema,
  generateDraftTour,
  generateDraftTourSchemaV2,
  generateDraftTourV2,
};

function getByUserId(req, res, next) {
  if (!req.user.id && req.user.role !== Role.Admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  tourHelper
    .getByUserId(req.user.id)
    .then((tours) => res.json(tours))
    .catch(next);
}
function getById(req, res, next) {
  // users can get their own tour and admins can get any tour
  tourHelper
    .getByTourId(req.params.id)
    .then((tour) => {
      if (tour.ownerId !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      return tour ? res.json(tour) : res.sendStatus(404);
    })
    .catch(next);
}
function createSchema(req, res, next) {
  const schema = Joi.object({
    ownerId: Joi.number().required(),
    currentLocation: Joi.number().required(),
    locations: Joi.array().required(),
    started: Joi.date().required(),
    rating: Joi.number().integer(),
    status: Joi.number().integer(),
    pictures: Joi.array(),
    end: Joi.date(),
  });
  validateRequest(req, next, schema);
}

function create(req, res, next) {
  tourHelper
    .create(req.body)
    .then((tour) => res.json(tour))
    .catch(next);
}

function updateSchema(req, res, next) {
  const schemaRules = {
    ownerId: Joi.number().empty(/.*/),
    locations: Joi.array().empty(/.*/),
    started: Joi.date().empty(/.*/),
    rating: Joi.number().integer(),
    status: Joi.number().integer(),
    pictures: Joi.array(),
    end: Joi.date(),
    currentLocation: Joi.number(),
  };

  // only admins can update specified field
  if (req.user.role === Role.Admin) {
    //schemaRules.role = Joi.string().valid(Role.Admin, Role.User).empty('');
  }

  const schema = Joi.object(schemaRules);
  validateRequest(req, next, schema);
}

function update(req, res, next) {
  //admins can update any tour, maybe moderator in future so this code still here although i except it through authorize() middleware
  if (req.user.role !== Role.Admin && !req.user.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  tourHelper
    .update(req.params.id, req.body, req.user.id, req.user.role === Role.Admin)
    .then((tour) => res.json(tour))
    .catch(next);
}

function _delete(req, res, next) {
  tourHelper
    .getByTourId(req.params.id)
    .then((tour) => {
      if (tour.ownerId !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: "Unauthorized" });
      } else if (req.user.role !== Role.Admin) {
        return tourHelper
          .cancelTourById(req.params.id)
          .then(() => res.json({ message: "Tour canceled successfully" }))
          .catch(next);
      } else {
        return tourHelper
          .delete(req.params.id)
          .then(() => res.json({ message: "Tour deleted successfully" }))
          .catch(next);
      }
    })
    .catch(next);
}

function generateDraftTourSchema(req, res, next) {
  const schema = Joi.object({});
  validateRequest(req, next, schema);
}

function generateDraftTour(req, res, next) {
  tourHelper.generateDraftTour()
  .then((tour) => res.json(tour))
  .catch(next)
}


function generateDraftTourSchemaV2(req, res, next) {
  const schema = Joi.object({
    keywords: Joi.array().required(),
    lat: Joi.number().required(),
    long: Joi.number().required(),
    maxDistance: Joi.number().required(),
    nLocation: Joi.number().integer(),
    goBy: Joi.string().required(),
    locationTypes: Joi.array(),
    // start: Joi.date(),
    // end: Joi.date(),
    priority: Joi.array(),
  });
  validateRequest(req, next, schema);
}

function generateDraftTourV2(req, res, next) {
  tourHelper.generateDraftTourV2(req.body)
  .then((tour) => res.json(tour))
  .catch(next)
}