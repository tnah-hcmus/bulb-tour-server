const { review: Review } = require("models/index");
const locationHelper = require('controllers/location/location.service')
const userHelper = require('controllers/user/user.service')
module.exports = {
  getByLocationId,
  getByUserId,
  create,
  update,
  delete: _delete,
  getByReviewId,
};

async function getByLocationId(id) {
  try {
    return await Review.findAll({ where: { locationId: id } });
  } catch (err) {
    throw err;
  }
}

async function getByUserId(id) {
  try {
    return await Review.findAll({ where: { ownerId: id } });
  } catch (err) {
    throw err;
  }
}

async function create(params) {
  try {
    let review = await getByIdentity(params.ownerId, params.locationId);
    if(review) throw 'Already have review on this location';
    else review = new Review(params);
    
    await Promise.all([
      review.save(),
      locationHelper.updateRating(params.locationId, params.rating, true),
      userHelper.updatePoint(params.ownerId)
    ]);
    return review;
  } catch (err) {
    throw err;
  }
}

async function update(id, params, isAdmin) {
  try {
    const review = await getByReviewId(id);
    if (review.ownerId === id || isAdmin) {
      if (!isAdmin && params.rating) {
        if (review.canEditRating) {
          review.canEditRating = false;
          locationHelper.updateRating(id, params.rating, false, review.rating);
        }
        else throw "Can't not edit rating anymore";
      }
      // copy params to account and save
      Object.assign(review, params);
      await review.save();
    } else throw { name: "UnauthorizedError" };
  } catch (err) {
    throw err;
  }
}

async function _delete(id) {
  try {
    const review = await getByReviewId(id);
    await review.destroy();
  } catch (err) {
    throw err;
  }
}

async function getByIdentity(ownerId, locationId) {
  try {
    const review = await Review.findOne({where: {locationId, ownerId}});
    return review;
  } catch (err) {
    throw err;
  }
}

async function getByReviewId(id) {
  try {
    const review = await Review.findByPk(id);
    if (!review) throw "Review not found";
    return review;
  } catch (err) {
    throw err;
  }
}
