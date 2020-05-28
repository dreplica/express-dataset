const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database(':memory:');

db.serialize(function() {
	//create table here for the events
	db.get('PRAGMA foreign_keys = ON');
	db.run(`CREATE TABLE  IF NOT EXISTS events (
        _id INTEGER PRIMARY KEY AUTOINCREMENT,
        id INTEGER NOT NULL,
        type VARCHAR NOT NULL,
        created_at VARCHAR NOT NULL
    )`);

	db.run(`CREATE TABLE  IF NOT EXISTS actor (
        _id INTEGER PRIMARY KEY AUTOINCREMENT,
        id INTEGER NOT NULL,
        eventid INTEGER,
        login VARCHAR NOT NULL,
        avatar_url VARCHAR NOT NULL,

        CONSTRAINT fk_events
            FOREIGN KEY (eventid)
            REFERENCES events(_id)
            ON DELETE CASCADE
    )`);

	db.run(`CREATE TABLE  IF NOT EXISTS repo (
        _id INTEGER PRIMARY KEY AUTOINCREMENT,
        id INTEGER NOT NULL,
        eventid INTEGER,
        name VARCHAR NOT NULL,
        url VARCHAR NOT NULL, 

        CONSTRAINT fk_events
            FOREIGN KEY (eventid)
            REFERENCES events(_id)
            ON DELETE CASCADE
    )`);

	console.log('table created');
});

// db.close();

module.exports = db;
