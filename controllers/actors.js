const db = require('../model/sqlite3setup');

const resolver = (check, data = [], error = 'not available') =>
	new Promise((resolve, reject) => {
		db.all(check, data, (err, row) => {
			if (err) {
				console.log(err);
				return reject({ error: error });
			}
			return resolve(row);
		});
	});

const sorting = (arr) => {
	return [ ...arr ].sort((a, b) => {
		if (b.id - a.id === 0) {
			console.log('same id');
			if (Date.now(b.created_at) - Date.now(a.created_at) === 0) {
				console.log('same date');
				if (b.actor.login - a.actor.login > 0) return -1;
				else return 1;
			} else if (Date.now(b.created_at) - Date.now(a.created_at) > 0) return 1;
			else return -1;
		} else if (b.id - a.id > 0) return 1;
		else return -1;
	});
};

var getAllActors = async () => {
	try {
		const actors = await resolver(`
		SELECT 
		e.id, e.type,e.created_at, 
		a.id,a.login,a.avatar_url,
		r.id,r.name,r.url
		COUNT(login) 
		FROM actor a
		JOIN events e
		ON e._id = a.eventid
		JOIN repo r
		ON r.id = e._id
		GROUP BY login `);

		console.log(actors);
		// const allActors = actors.map((events) => ({
		// 	id: events.id,
		// 	type: events.type,
		// 	actor: {
		// 		id: events.actorid,
		// 		login: events.actorlogin,
		// 		avatar_url: events.actorurl
		// 	},
		// 	created_at: events.created_at
		// }));

		// const sortedActors = sorting(allActors);
		// console.log(sortedActors);
		// const getActors = sortedActors.map((actor) => actor.actor);

		// console.log(getActors);
		// return getActors;
	} catch (error) {
		return { error: 'couldnt access data' };
	}
};

var updateActor = (body) => {
	return new Promise((resolve, reject) => {
		db.serialize(async function() {
			try {
				const update = await resolver(`SELECT id FROM actor WHERE id=${body.id}`);

				if (!update.length) {
					return reject({ error: 'not found', code: 404 });
				}

				resolver(`UPDATE actor SET login=$login, avatar_url=$url where id=$id`, [
					body.login,
					body.avatar_url,
					body.id
				]);
				return resolve([]);
			} catch (error) {
				return reject({ error: 'actor is being updated', code: 400 });
			}
		});
	});
};

var getStreak = async () => {
	try {
		const actors = await resolver(`
		SELECT e.id as eventid,a.id as id, a.login as login, 
		a.avatar_url as avatar_url
		FROM actor a
		INNER JOIN events e
		ON a.eventId=e.id`);

		const sorted = [ ...actors ].sort((a, b) => b.eventid - a.eventid);
		const actorsResult = sorted.map((item) => ({
			id: item.id,
			login: item.login,
			avatar_url: item.avatar_url
		}));

		console.log(actors);
		console.log(actorsResult);
		return actorsResult;
	} catch (error) {
		return { error: 'couldnt access data' };
	}
};

module.exports = {
	updateActor: updateActor,
	getAllActors: getAllActors,
	getStreak: getStreak
};
