var mongodb = require('mongodb').MongoClient;
//var mongoURI = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/scibowldb';
var mongoURI = 'mongodb://heroku_app35375475:a0mso3fam1vi2hosu3u0v0mie8@ds037097.mongolab.com:37097/heroku_app35375475';

module.exports.initializeMongo = function (callback) {
	mongodb.connect(mongoURI,function(err,db){
		db.collection('questionData').ensureIndex({question: 1}, {unique: true, sparse: true, dropDups: true}, function(err){
			if (err) throw err;
			module.exports.docdb = db;
			module.exports.closeDb = function() {db.close();}
			callback(err);
		});
	});
};