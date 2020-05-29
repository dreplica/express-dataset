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

const getStreakDistro = (arr) => {
	const calculateDate = (dateA, dateB) => {
		if (dateA > dateB) return dateA - dateB;
		return dateB - dateA;
	};
	//get unuique login
	const uniqueId = new Set([ ...arr.map((item) => item.login) ]);
	const uniqueLogin = [ ...uniqueId ];
	const stopper = arr.length - 1;

	//i stopped here, i was trying to get the count and latest date to work
	const datePack = uniqueLogin.map((login) =>
		arr.reduce(
			(acc, val, index) => {
				if (acc.count && val.login === login) {
					acc.count = calculateDate(acc.count, new Date(val.created_at).getTime());
					acc.created_at = [ acc.created_at, val.created_at ].sort((initial, later) => {
						if (new Date(initial).getTime() > new Date(later).getTime()) return -1;
						return 1;
					})[0];
				}

				if (acc.count > 10000000000 && index === stopper) {
					('hello');
					acc.count = 1;
				}

				if (val.login === login && !acc.count) {
					acc.count = index === stopper ? 1 : new Date(val.created_at).getTime();
					acc.actor.id = val.id;
					acc.actor.login = login;
					acc.actor.avatar_url = val.avatar_url;
					acc.created_at = val.created_at;
					return acc;
				}
				return acc;
			},
			{ count: 0, actor: { id: 0, login: '', avatar_url: '' }, created_at: '' }
		)
	);
	return datePack;
};

const sorting = (arr) => {
	return [ ...arr ].sort((a, b) => {
		if (b.count - a.count === 0) {
			console.log('same count');
			if (new Date(b.created_at).getTime() - new Date(a.created_at).getTime() === 0) {
				console.log('same date');
				if (b.actor.login - a.actor.login > 0) return -1;
				else return 1;
			} else if (new Date(b.created_at).getTime() - new Date(a.created_at).getTime() > 0) return 1;
			else return -1;
		} else if (b.count - a.count > 0) return 1;
		else return -1;
	});
};

var getAllActors = async () => {
	try {
		const actors = await resolver(`
		SELECT 
		e.created_at, 
		a.id as actorid,a.login,a.avatar_url,
		COUNT(login) as count
		FROM actor a
		JOIN events e
		ON e._id = a.eventid
		GROUP BY a.login `);

		const allActors = actors.map((events) => ({
			count: events.count,
			actor: {
				id: events.actorid,
				login: events.login,
				avatar_url: events.avatar_url
			},
			created_at: events.created_at
		}));

		const sortedActors = sorting(allActors);
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
		const datr = await resolver(`
		SELECT e.created_at, a.login,a.id,a.avatar_url
		FROM actor a
		JOIN events e
		ON e._id = a.eventid`);
		console.log('data', datr);

		const unique = getStreakDistro(datr);
		console.log('this is unique', unique);
		return sorting(unique).map((act) => act.actor);
	} catch (error) {
		console.log(error);
	}
};

module.exports = {
	updateActor: updateActor,
	getAllActors: getAllActors,
	getStreak: getStreak
};
