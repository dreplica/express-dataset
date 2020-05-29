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
		if (b.count - a.count === 0) {
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
		a.id as actorid,a.login,a.avatar_url,
		COUNT(login) as count
		FROM actor a
		JOIN events e
		ON e._id = a.eventid
		GROUP BY a.login `);

		// console.log(actors);
		const allActors = actors.map((events) => ({
			id: events.id,
			count: events.count,
			type: events.type,
			actor: {
				id: events.actorid,
				login: events.login,
				avatar_url: events.avatar_url
			},
			created_at: events.created_at
		}));

		// console.log(allActors);
		const sortedActors = sorting(allActors);
		// console.log('sorted', sortedActors);
		return [ ...sortedActors.map((actor) => actor.actor) ];
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
				return resolve({});
			} catch (error) {
				return reject({ error: 'actor is being updated', code: 400 });
			}
		});
	});
};

var getStreak = async () => {
	try {
		console.log(await resolver('SELECT date("now")'));
		const datr = await resolver(`
		SELECT a.login, SUM(strftime('%s', e.created_at) - strftime('%s', '00:00:00')) as count
		FROM events e
		JOIN actor a
		ON e._id = a.eventid
		GROUP BY a.login`);
		console.log(datr);
	} catch (error) {
		console.log(error);
	}
};

module.exports = {
	updateActor: updateActor,
	getAllActors: getAllActors,
	getStreak: getStreak
};
