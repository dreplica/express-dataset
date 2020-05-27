const db = require('../model/sqlite3setup')

const resolver = (check, error = 'not available') => new Promise((resolve, reject) => {
	db.all(check, (err, row) => {
		if (err) {
			console.log(err)
			return reject({error:error})
		}
		return resolve(row)
	})
})


var getAllEvents = () => {
	return new Promise((resolve, reject) => {
		db.serialize(async function () {
			// let j;
		    const event =()=>new Promise((resolve) db.each(`SELECT id,type,created_at FROM events`, (err, row) => console.log(row))
			console.log("here is it",event)
		})
	})
};

var addEvent = () => {

};


var getByActor = () => {

};


var eraseEvents = () => {

};

module.exports = {
	getAllEvents: getAllEvents,
	addEvent: addEvent,
	getByActor: getByActor,
	eraseEvents: eraseEvents
};
