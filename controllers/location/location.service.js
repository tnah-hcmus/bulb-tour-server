const { location: Location } = require("models/index");

module.exports = {
  create,
  update,
  updateRating,
  delete: _delete,
  getByLocationId,
  getNearby
};

async function create(params) {
  try {
    const location = new Location(params);
    // save payment
    await location.save();
    return location;
  } catch (err) {
    throw err;
  }
}

async function update(id, params) {
  try {
    const location = await getByLocationId(id);
    // copy params to account and save
    Object.assign(location, params);
    await location.save();
  } catch (err) {
    throw err;
  }
}

async function _delete(id) {
  try {
    const location = await getByLocationId(id);
    await location.destroy();
  } catch (err) {
    throw err;
  }
}

async function getByLocationId(id) {
  try {
    const location = await Location.findByPk(id);
    if (!location) throw "Location not found";
    return location;
  } catch (err) {
    throw err;
  }
}

async function getByHash(hash) {
	try {
		const locations = await Location.findAll({ where: { hash } });
		if (!locations) throw "Location not found";
		return locations;
	} catch (err) {
		throw err;
	}
}

async function getNearby({ lat, long }) {
  try {
    const locations = await Location.findAll();
    return locations;
  } catch (err) {
    err;
  }
}

async function updateRating(id, rating, isNew, oldRating) {
  try {
    const location = await getByLocationId(id);
    const totalRating = location.rating * location.ratingNumber;
    if (isNew) {
      location.rating = (totalRating + rating) / (location.ratingNumber + 1);
      location.ratingNumber++;
    } else {
      location.rating =
        (totalRating + rating - oldRating) / location.ratingNumber;
    }
    await location.save();
  } catch (err) {
    throw err;
  }
}
