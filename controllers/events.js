const db = require('../model/sqlite3setup')

const resolver =(check,arg,error='not available')=> new Promise((resolve,reject) => {
	if (check) {
		return resolve(arg)
	}
	return reject({error:error})
})


var getAllEvents = () => {
	return new Promise((resolve, reject) => {
		db.serialize(async function () {
			// let j;
		    const event =  db.all(`SELECT id,type,created_at FROM events`, (err, row) => console.log(row))
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
