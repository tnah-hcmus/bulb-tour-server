const reviewHelper = require("./review.service");
const Joi = require("joi");
const validateRequest = require("middleware/validate-request");
const Role = require("helper/role");

module.exports = {
  getByLocationId,
  getByUserId,
  getById,
  createSchema,
  create,
  updateSchema,
  update,
  delete: _delete,
  updatePicturesSchema,
  updatePictures
};

function updatePicturesSchema(req, res, next) {
  const schema = Joi.object({
    operation: Joi.string().required(),
    uploadId: Joi.string().required(),
    reviewId: Joi.integer().required()
  });
  validateRequest(req, next, schema);
}

function updatePictures(req, res, next) {
  req.body.userId = req.user.id;
  reviewHelper.updatePictures(req.body)
  .then((result) => res.send(result))
  .catch(next);
}

function getByLocationId(req, res, next) {
  if (!req.query.location) {
    next();
  } else {
    reviewHelper
      .getByLocationId(req.query.location)
      .then((reviews) => res.json(reviews))
      .catch(next);
  }
}

function getByUserId(req, res, next) {
  if (!req.user.id && req.user.role !== Role.Admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  reviewHelper
    .getByUserId(req.user.id)
    .then((reviews) => res.json(reviews))
    .catch(next);
}

function getById(req, res, next) {
  reviewHelper
    .getByReviewId(req.params.id)
    .then((review) => {
      return review ? res.json(review) : res.sendStatus(404);
    })
    .catch(next);
}

function createSchema(req, res, next) {
  const schema = Joi.object({
    ownerId: Joi.number().required(),
    locationId: Joi.number().required(),
    rating: Joi.number().required(),
    text: Joi.string(),
    canEditRating: Joi.boolean(),
    pictures: Joi.array(),
  });
  validateRequest(req, next, schema);
}

function create(req, res, next) {
  reviewHelper
    .create(req.body)
    .then((review) => res.json(review))
    .catch(next);
}

function updateSchema(req, res, next) {
  const schemaRules = {
    ownerId: Joi.number().empty(/.*/),
    locationId: Joi.number().empty(/.*/),
    canEditRating: Joi.boolean().empty(/.*/),
    text: Joi.string(),
    pictures: Joi.array(),
    rating: Joi.number(),
  };

  const schema = Joi.object(schemaRules);
  validateRequest(req, next, schema);
}

function update(req, res, next) {
  if (!req.user.id && req.user.role !== Role.Admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  reviewHelper
    .update(req.params.id, req.body, req.user.role === Role.Admin)
    .then((review) => res.json(review))
    .catch(next);
}

function _delete(req, res, next) {
  reviewHelper
    .getByReviewId(req.params.id)
    .then((review) => {
      if (review.ownerId !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: "Unauthorized" });
      } else {
        return reviewHelper
          .delete(req.params.id)
          .then(() => res.json({ message: "Review deleted successfully" }))
          .catch(next);
      }
    })
    .catch(next);
}
