const sqlite = require('sqlite3').verbose()
const db = new sqlite.Database(':memory:');

db.serialize( function () {
    //create table here for the events
    db.run(`CREATE TABLE  IF NOT EXISTS events (
        id INTEGER NOT NULL,
        type VARCHAR NOT NULL,
        created_at VARCHAR NOT NULL
    )`)

    db.run(`CREATE TABLE  IF NOT EXISTS actor (
        id INTEGER NOT NULL,
        eventid INTEGER NOT NULL,
        login VARCHAR NOT NULL,
        avatar_url VARCHAR NOT NULL,

        CONSTRAINT fk_eventid
            FOREIGN KEY (eventid)
            REFERENCES event(id)
            ON DELETE CASCADE
    )`)


    db.run(`CREATE TABLE  IF NOT EXISTS repo (
        id INTEGER NOT NULL,
        eventid INTEGER NOT NULL,
        name VARCHAR NOT NULL,
        url VARCHAR NOT NULL, 

        CONSTRAINT fk_eventid
            FOREIGN KEY (eventid)
            REFERENCES event(id)
            ON DELETE CASCADE
    )`)


})

// db.close();

module.exports = db