var path = require('path');
var db = require('./../db.js');
var ObjectID = require('mongodb').ObjectID;
var userData = db.docdb.collection('userData');

module.exports.get = function(req,res){
	if (req.session.user) res.sendFile(path.join(__dirname, '../templates', 'setup.html'));
	else res.redirect("/");
}

module.exports.post = function(req,res){
	console.log(req.session.user);
	console.log(req.body);
	userData.update({"_id":new ObjectID(req.session.user["_id"])},{$set:{"questionsPref":{"subjectsPref":req.body["selectedSubjects"],"qTypesPref":req.body["selectedQTypes"]}}}, function(err,docs){
		if (err) throw err;
		res.send({redirect:'/quiz'});
	});
};