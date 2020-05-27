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


var getAllActors = async () => {
	try {
		const actors = await resolver(`SELECT id,login,avatar_url FROM actor`)
		console.log(actors)
		return actors
	} catch (error) {
		return ({error:"couldnt access data"})
	}
};

var updateActor = (body) => {

	return new Promise((resolve, reject) => {
		db.serialize(function () {
			try {	
				db.run(`
				UPDATE actor SET login=$login, 
				avatar_url=$url
				where id=$id`,[body.login,body.avatar_url,body.id])

				return resolve([])
			} catch (error) {
				return reject({error:"actor not found"})
			}
		})
	})
};


var getStreak = async () => {
	try {
		const actors = await resolver(`
		SELECT e.id as eventid,a.id as id, a.login as login, 
		a.avatar_url as avatar_url
		FROM actor a
		INNER JOIN events e
		ON a.eventId=e.id`)

		const sorted = [...actors].sort((a, b) => b.eventid - a.eventid);
		const actorsResult = sorted.map(item => ({
			id: item.id,
			login: item.login,
			avatar_url:item.avatar_url
		}))

		console.log(actors)
		console.log(actorsResult)
		return actorsResult
	} catch (error) {
		return ({error:"couldnt access data"})
	}
};


module.exports = {
	updateActor: updateActor,
	getAllActors: getAllActors,
	getStreak: getStreak
};
