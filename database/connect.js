const Datastore = require("nedb");
const { database } = require("../config");

const db = new Datastore({
  filename: database.filename, 
  autoload: database.autoload 
});

db.loadDatabase( function(err) {
  if( err ) {
    throw "cannot connect to database";
  }
})

module.exports = db;

