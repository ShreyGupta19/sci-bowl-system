var path = require('path');
var db = require('./../db.js');

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
		if(req.query.type==="randomQuestion"){
			rooms.find({},{name:1,_id:0}).toArray(function(err,docs){
				if(err) throw err;
				else if(!docs.length){
					res.send({error:"No chat rooms found."});
				}
				else {
					var groupNames = [];
					docs.forEach(function(doc){
						groupNames.push(doc.name);
					});
					res.send({names:groupNames});
				}
			});
		}
	}
	res.sendFile(path.join(__dirname, '../templates', 'quiz.html'));
}

module.exports.post = function(req,res){
	if(req.body.type === "login"){
		db.userData.find({email:req.body["login-email"],password:req.body["login-password"]}).toArray(function(err,docs){
			if(err) throw err;
			else if(!docs.length){
				res.send({error:"Incorrect email or password."});
			}
			else {
				req.session.user = docs[0];
				db.userData.update({email:docs[0].email}, {$push:{logins: new Date().toISOString()}}, function(err, result){
					if(err) throw err;
					res.send({redirect:'/quiz'});
				});
			}
		});
	}
	else if(req.body.type === "register"){
		var newUserDoc = {email:req.body["login-email"], password:req.body["login-password"], name:{first:req.body["login-name"].split(" ")[0], last:req.body["login-name"].split(" ")[1]}, logins:[new Date().toISOString()]};
		db.userData.find({email:req.body["login-email"]}).toArray(function(err,docs){
			if (err) throw err;
			else if (docs.length) res.send({error: "You already have an account!"});
			else {
				db.userData.insert(newUserDoc,function(err,records){
					if(err) throw err;
					req.session.user = records[0];
					res.send({redirect:'/quiz'});
				});
			}
		});
	}
};