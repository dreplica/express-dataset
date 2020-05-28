const db = require('../model/sqlite3setup');
const { resolve } = require('bluebird');

const resolver = (check, error = 'not available') =>
	new Promise((resolve, reject) => {
		db.all(check, (err, row) => {
			if (err) {
				console.log(err);
				return reject({ error: error });
			}
			return resolve(row);
		});
	});

var getAllEvents = () => {
	return new Promise((resolve, reject) => {
		db.serialize(async function() {
			// let j;
			try {
				const event = await resolver(
					`SELECT 
					e.id as id, e.type as type,e.created_at as created_at, 
					a.id as actorid, a.login as actorlogin, a.avatar_url as actorurl,
					r.id as repoid, r.name as reponame, r.url as repourl
					FROM events  e
					INNER JOIN actor a
					ON a.eventid = e._id
					INNER JOIN repo r
					ON r.eventid = a.eventid`
				);
				console.log(event);

				if (event.error) {
					return reject({ error: event.error.message });
				}

				const sortedEvents = [ ...event ].sort((a, b) => a.id - b.id);

				const allEvents = sortedEvents.map((events) => ({
					id: events.id,
					type: events.type,
					actor: {
						id: events.actorid,
						login: events.actorlogin,
						avatar_url: events.actorurl
					},
					repo: {
						id: events.repoid,
						name: events.reponame,
						url: events.repourl
					},
					created_at: events.created_at
				}));

				return resolve(allEvents);
			} catch (error) {
				console.log(error.mesage);
				return reject({ error: error.message });
			}
		});
	});
};

var addEvent = (body) => {
	return new Promise((resolve, reject) => {
		db.serialize(async function() {
			try {
				const check = await resolver(`SELECT id FROM events WHERE id=$id`, [ body.id ]);
				console.log('this is check', check);
				// if (await check()) {
				// 	return reject({error:"exist",code:404})
				// }

				db.each(`INSERT INTO events VALUES(NULL,$id,$type,$created_at)`, [
					body.id,
					body.type,
					body.created_at
				]);

				//i stopped here, i need the id from here to use as foreign key.
				const last_id_gotten = await resolver(`SELECT last_insert_rowid() FROM events`);

				const last_id = last_id_gotten[0]['last_insert_rowid()'];

				db.each(`INSERT INTO actor VALUES(NULL,$id,$eid,$login,$url)`, [
					body.actor.id,
					last_id,
					body.actor.login,
					body.actor.avatar_url
				]);

				db.each(`INSERT INTO repo VALUES(NULL,$id,$eid,$name,$url)`, [
					body.repo.id,
					last_id,
					body.repo.name,
					body.repo.url
				]);

				return resolve({ message: 'inserted', code: 201 });
			} catch (error) {
				console.log('error happened', error.message);
			}
		});
	});
};

var getByActor = (id) => {
	console.log(id);
	return new Promise((resolve, reject) => {
		db.serialize(async function() {
			try {
				const events = await resolver(
					`SELECT 
					e.id as id, e.type as type,e.created_at as created_at, 
					a.id as actorid, a.login as actorlogin, a.avatar_url as actorurl,
					r.id as repoid, r.name as reponame, r.url as repourl
					FROM events  e
					INNER JOIN actor a
					ON a.eventid = e.id
					INNER JOIN repo r
					ON r.eventid = a.eventid
					WHERE e.id=${id}
					`
				);
				console.log('event', events);
				if (events.error) {
					return reject({ error: events.error.message });
				}
				const actor = events.map((event) => ({
					id: event.id,
					type: event.type,
					actor: {
						id: event.actorid,
						login: event.actorlogin,
						avatar_url: event.actorurl
					},
					repo: {
						id: event.repoid,
						name: event.reponame,
						url: event.repourl
					},
					created_at: event.created_at
				}));
				console.log('thisis actor', actor);
				return resolve(actor);
			} catch (e) {
				console.log(e.message);
				return reject({ error: 'sorry couldnt find actor' });
			}
		});
	});
};

var eraseEvents = () => {
	db.serialize(async function() {
		const erase = await resolver(`DELETE FROM  events`);
		const test = await resolver('SELECT * FROM actor');
		console.log(test);
	});
};

module.exports = {
	getAllEvents: getAllEvents,
	addEvent: addEvent,
	getByActor: getByActor,
	eraseEvents: eraseEvents
};
