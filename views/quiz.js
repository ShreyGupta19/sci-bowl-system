var path = require('path');
var db = require('./../db.js');
var questionData = db.docdb.collection('questionData');
var userData = db.docdb.collection('userData');
var ObjectID = require('mongodb').ObjectID;
var thisUser;

function isEmpty(obj) {
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	if (obj == null) return true;
	if (obj.length > 0) return false;
	if (obj.length === 0) return true;
	for (var key in obj) if (hasOwnProperty.call(obj, key)) return false;
	return true;
}

module.exports.get = function(req,res){
	if(!isEmpty(req.query)){
		if(req.query.type==="getRandomQuestion"){
			questionData.find({"normSubject":{$in:thisUser.questionsPref.subjectsPref},"type":{$in:thisUser.questionsPref.qTypesPref},"_id":{$nin:thisUser.questionIds}}).limit(1).toArray(function(err,docs){
				if(err) throw err;
				else {
					res.send(docs[0]);
				}
			});
		}
	}
	else {
		if (req.session.user) {
			thisUser = req.session.user;
			thisUser.questionIds = [];
			thisUser.questionsAnswered.forEach(function(elem){
				thisUser.questionIds.push(new ObjectID(elem.questionId));
			});
			res.sendFile(path.join(__dirname, '../templates', 'quiz.html'));
		}			
		else res.redirect("/");
	}
}

module.exports.post = function(req,res){
	if(req.body.type === "logQuestion"){
		userData.update({"_id":new ObjectID(thisUser["_id"])},{$push:{"questionsAnswered":req.body.qData}},function(err,docs){
			if(err) throw err;
			thisUser.questionIds.push(new ObjectID(req.body.qData.questionId));
			res.send({}); 
		});
	}
};