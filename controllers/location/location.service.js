const { location: Location } = require("models/index");
const geohash = require("ngeohash");
const { Op } = require("sequelize");
require("dotenv").config();
module.exports = {
	create,
	update,
	updateRating,
	delete: _delete,
	getByLocationId,
	getNearby,
	searchByName
};

async function create(params) {
	try {
		//params.hash = createHash(params)
		params.hash = geohash.encode(params.lat, params.long, 9);
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

async function getNearby({ lat, long, lv }) {
	try {
		const level = lv||process.env.GEOHASH_LEVEL_NEARBY;
		//config nearby level or nearby distance
		const neighbors = geohash.neighbors(geohash.encode(lat, long, level));
		neighbors.push(geohash.encode(lat, long, level));
		// console.log(neighbors)
		const options = neighbors.map((geoString) => ({
			[Op.startsWith]: geoString,
		}));
		const locations = await Location.findAll({
			where: { hash: { [Op.or]: options } },
		});
		return locations;
	} catch (err) {
		throw err;
	}
}

async function searchByName({search}) {
	try {
		const locations = await Location.findAll({
			where: { name: { [Op.like]:  `%${search}%`} },
		});
		return locations;
	} catch (err) {
		throw err;
	}
}

async function updateRating(id, rating, isNew, oldRating) {
	try {
		const location = await getByLocationId(id);
		const totalRating = location.rating * location.ratingNumber;
		if (isNew) {
			location.rating =
				(totalRating + rating) / (location.ratingNumber + 1);
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
