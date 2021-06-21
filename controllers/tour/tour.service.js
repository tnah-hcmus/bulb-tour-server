const { tour: Tour } = require("models/index");
const { location: Location } = require("models/index");
const geohash = require("ngeohash");
const { Op } = require("sequelize");
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
	const nLocation = param.nLocation || 4;
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
		let ret = [];
		let marker = [];
		for (let i = 0; i < locations.length; i++) marker.push(-1);
		for (let i = 0; i < nLocation; i++) {
			let thisLv = [];
			if (i == 0) {
				//Stop1 lấy tất cả xung quanh bán kính R đang đứng
				for (let j = 0; j < locations.length; j++) {
					if (distance(locations[j], param) < r) {
						thisLv.push(locations[j]);
						marker[j] = 0;
						if (thisLv.length == 4) break;
					}
				}
			} else {
				let preLv = ret[ret.length - 1];
				for (let j = 0; j < preLv.length; j++) {
					for (let t = 0; t < locations.length; t++) {
						//Nếu điểm trong location chưa được chọn và nằm trong bán kính R bất đầu bới 1 điểm trong list stop trước
						// if(marker[t]<0) console.log(distance(locations[t], preLv[j]));
						if (
							marker[t] < 0 &&
							distance(locations[t], preLv[j]) < r
						) {
							//Tính độ chéo
							let de = degree(locations[t], preLv[j], param);
							//nếu không phải tại điểm quay đầu mà quay đầu thì bỏ quá
							// if(!(mustReturn && i==Math.floor(nLocation/2) && de<60)) continue;
							//Nếu không đi ra xa thì bỏ qua
							// if(de <= 90) continue;
							thisLv.push(locations[t]);
							marker[t] = 0;
							if (thisLv.length == 4) break;
						}
					}
				}
			}
			ret.push(thisLv);
		}
		// let randomLv = [];
		// for (let i = 0; i < marker.length; i++) {
		// 	if (marker[i] == -1) {
		// 		randomLv.push(locations[i]);
		// 	}
		// }
		// ret.push(randomLv);
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
