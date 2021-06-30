const { tour: Tour } = require("models/index");
const { location: Location } = require("models/index");
const geohash = require("ngeohash");
const { Op } = require("sequelize");
const {wordScore} = require("helper/words-utils");
module.exports = {
	getByUserId,
	create,
	update,
	delete: _delete,
	getByTourId,
	cancelTourById,
	generateDraftTour,
	generateDraftTourV2,
};

function distance(pos1, pos2) {
	const { lat: lat1, long: lon1 } = pos1;
	const { lat: lat2, long: lon2 } = pos2;
	if (lat1 == lat2 && lon1 == lon2) {
		return 0;
	} else {
		var radlat1 = (Math.PI * lat1) / 180;
		var radlat2 = (Math.PI * lat2) / 180;
		var theta = lon1 - lon2;
		var radtheta = (Math.PI * theta) / 180;
		var dist =
			Math.sin(radlat1) * Math.sin(radlat2) +
			Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = (dist * 180) / Math.PI;
		dist = dist * 60 * 1.1515;
		dist = dist * 1.609344;
		return dist;
	}
}

function degree(A, B, C) {
	const AB = distance(A, B);
	const AC = distance(A, C);
	const BC = distance(B, C);
	const cos = (AB * AB + AC * AC - BC * BC) / (2 * AB * AC);
	const deg = (180 / Math.PI) * Math.acos(cos);
	return deg;
}

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

async function generateDraftTourV2(param) {
	const geoLevelHeight = [4992.6, 624.1, 156, 19.5, 4.9, 0.6094];
	let nLocation = param.nLocation || 4;
	if (param.goBy == "random") return generateDraftTour(param);
	const mustReturn = param.goBy == "BICYCLE" || param.goBy == "SCOOTER";
	const r = param.maxDistance / nLocation;
	try {
		let firstRadius = param.maxDistance;
		let geoLevel;
		for (geoLevel = geoLevelHeight.length - 1; geoLevel >= 0; geoLevel--) {
			if (geoLevelHeight[geoLevel] > firstRadius) {
				geoLevel += 1;
				break;
			}
		}
		const neighbors = geohash.neighbors(
			geohash.encode(param.lat, param.long, geoLevel)
		);
		neighbors.push(geohash.encode(param.lat, param.long, geoLevel));
		const options = neighbors.map((geoString) => ({
			[Op.startsWith]: geoString,
		}));
		let locations = await Location.findAll({
			where: { hash: { [Op.or]: options } },
		});
		locations = locations.filter(
			(location) => distance(location, param) < firstRadius
		);
		locations.sort((location1, location2) => wordScore(param.keywords, location2) > wordScore(param.keywords, location1)?1 : -1);
		//sorting , filtering locations here


		//Gen
		let locationPerStop = Math.floor(locations.length / nLocation);
		if (nLocation > locations.length) {
			nLocation = locations.length;
			locationPerStop = 1;
		}
		locationPerStop = Math.min(locationPerStop, 4);
		let ret = [];
		let marker = [];
		for (let i = 0; i < locations.length; i++) marker.push(-1);
		if (!mustReturn) {
			for (let i = 0; i < nLocation; i++) {
				let thisLv = [];
				if (i == 0) {
					//Stop1 lấy tất cả xung quanh bán kính R đang đứng
					for (let j = 0; j < locations.length; j++) {
						if (distance(locations[j], param) < r) {
							thisLv.push(locations[j]);
							marker[j] = 0;
							if (thisLv.length == locationPerStop) break;
						}
					}
				} else {
					let preLv = ret[ret.length - 1];
					for (let j = 0; j < preLv.length; j++) {
						for (let t = 0; t < locations.length; t++) {
							if (
								marker[t] < 0 &&
								distance(locations[t], preLv[j]) < r &&
								distance(param, locations[t]) >
									distance(param, preLv[j])
							) {
								thisLv.push(locations[t]);
								marker[t] = 0;
								if (thisLv.length == locationPerStop) break;
							}
						}
					}
				}
				ret.push(thisLv);
			}
		} else {
			//Must return
			for (let i = 0; i < nLocation / 2; i++) {
				let thisLv = [];
				if (i == 0) {
					//Stop1 lấy tất cả xung quanh bán kính R đang đứng
					for (let j = 0; j < locations.length; j++) {
						if (distance(locations[j], param) < r) {
							thisLv.push(locations[j]);
							marker[j] = 0;
							if (thisLv.length == locationPerStop * 2) break;
						}
					}
				} else {
					let preLv = ret[ret.length - 1];
					for (let j = 0; j < preLv.length; j++) {
						for (let t = 0; t < locations.length; t++) {
							if (
								marker[t] < 0 &&
								distance(locations[t], preLv[j]) < r &&
								distance(param, locations[t]) >
									distance(param, preLv[j])
							) {
								thisLv.push(locations[t]);
								marker[t] = 0;
								if (thisLv.length == locationPerStop * 2) break;
							}
						}
					}
				}
				ret.push(thisLv);
			}
			for (let i = Math.ceil(nLocation / 2); i < nLocation; i++) {
				let len = nLocation;
				let count = Math.floor(ret[len - 1 - i].length / 2);
				let newLv = ret[len - 1 - i].splice(count, count);
				ret.push(newLv);
			}
		}
		//fill to location per stop with rest
		let rest = [];
		for (let i = 0; i < ret.length; i++) {
			if (ret[i].length < locationPerStop) {
				rest.push(i);
			}
		}
		if (rest.length > 0)
			for (let i = 0; i < marker.length; i++) {
				if (marker[i] == -1) {
					for (let j = 0; j < rest.length; j++) {
						if (ret[rest[j]].length < locationPerStop) {
							ret[rest[j]].push(locations[i]);
							marker[i] = 0;
							break;
						}
					}
				}
			}
		return ret;
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

async function update(id, params, requestId, isAdmin) {
	try {
		const tour = await getByTourId(id);
		if (tour.ownerId === requestId || isAdmin) {
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
