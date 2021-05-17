const { tour: Tour } = require("models/index");
const { location: Location } = require("models/index");
module.exports = {
  getByUserId,
  create,
  update,
  delete: _delete,
  getByTourId,
  cancelTourById,
  generateDraftTour,
};

async function generateDraftTour(param) {
  try {
    const stops = Math.round(Math.random() * 2 + 4);
    const allLocations = await Location.findAll();
    const locationPerStop = Math.min(
      Math.round(allLocations.length / stops),
      5
    );
    let result = [];
    for (let i = 0; i < stops; i++) {
      result.push(allLocations.splice(0, locationPerStop));
    }
    return result;
  } catch (err) {
    throw err;
  }
}

async function getByUserId(id) {
  try {
    return await Tour.findAll({ where: { ownerId: id } });
  } catch (err) {
    throw err;
  }
}
async function create(params) {
  try {
    const tour = new Tour(params);
    await tour.save();
    return tour;
  } catch (err) {
    throw err;
  }
}

async function update(id, params, isAdmin) {
  try {
    const tour = await getByTourId(id);
    if (tour.ownerId === id || isAdmin) {
      // copy params to account and save
      Object.assign(tour, params);
      await tour.save();
    } else throw { name: "UnauthorizedError" };
  } catch (err) {
    throw err;
  }
}

async function cancelTourById(id) {
  try {
    await update(id, { status: 2 });
  } catch (err) {
    throw err;
  }
}

async function _delete(id) {
  try {
    const tour = await getByTourId(id);
    await tour.destroy();
  } catch (err) {
    throw err;
  }
}

async function getByTourId(id) {
  try {
    const tour = await Tour.findByPk(id);
    if (!tour) throw "Tour not found";
    return tour;
  } catch (err) {
    throw err;
  }
}
