const db = require('../model/sqlite3setup')

const resolver = (check, error = 'not available') => new Promise((resolve, reject) => {
	db.all(check, (err, row) => {
		if (err) {
			console.log(err)
			return reject({ error: error })
		}
		return resolve(row)
	})
})


var getAllEvents = () => {
	return new Promise((resolve, reject) => {
		db.serialize(async function () {
			// let j;
			try {
				const event = await resolver(
					`SELECT 
					e.id as id, e.type as type,e.created_at as created_at, 
					a.id as actorid, a.login as actorlogin, a.avatar_url as actorurl,
					r.id as repoid, r.name as reponame, r.url as repourl
					FROM events  e
					INNER JOIN actor a
					ON a.eventid = e.id
					INNER JOIN repo r
					ON r.eventid = a.eventid`)
				console.log(event)

				if (event.error) {
					return reject({ error: event.error.message })
				}

				const allEvents = event.map(events => ({
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
				}))

				return resolve(allEvents)

			} catch (error) {
				console.log(error.mesage)
				return reject({ error: error.message })
			}

		})
	})
};

var addEvent = (body) => {
	console.log("body started")
	db.serialize(function () {
		try {
			
			const eventInsert = db.prepare(`
			INSERT INTO events 
			VALUES($id,$type,$created_at)`)

			eventInsert.run(
				body.id,
				body.type,
				body.created_at,
			)
			eventInsert.finalize();
	
			const actorInsert = db.prepare(`
			INSERT INTO actor 
			VALUES($id,$eid,$login,$url)
			`)

			actorInsert.run(
				body.actor.id,
				body.id,
				body.actor.login,
			    body.actor.avatar_url
			)
			actorInsert.finalize()
	
			const repoInsert = db.prepare(`
			INSERT INTO repo 
			VALUES($id,$eid,$name,$url)
			`)

			repoInsert.run(
				body.repo.id,
				body.id,
				body.repo.name,
				body.repo.url
			)
			repoInsert.finalize()
		} catch (error) {
			console.log("error happened",error.message)
		}
	})
};


var getByActor = (id) => {
	console.log(id)
	return new Promise((resolve, reject) => {
		db.serialize(async function(){
			try{const events = await resolver(
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
					`)
			console.log("event",events)
			if (events.error) {
				return reject({error:events.error.message})
			}
			const actor = events.map(event=>({
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
			}))
			console.log("thisis actor", actor)
			return resolve(actor)
			} catch (e) {
				console.log(e.message)
				return reject({error:"sorry couldnt find actor"})
			}
		})
	})
};


var eraseEvents = () => {
	db.serialize(async function () {
		const erase = await resolver(`DELETE FROM  events`)
		console.log(erase)
	})
};

module.exports = {
	getAllEvents: getAllEvents,
	addEvent: addEvent,
	getByActor: getByActor,
	eraseEvents: eraseEvents
};
