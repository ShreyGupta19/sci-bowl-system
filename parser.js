var fs = require('fs');
var db = require('./db.js')

var parserScope = {};

module.exports.parseRound = function(fileName,callback) {
	fs.readFile(fileName, {"encoding":"utf-8"}, function(err,data){
		if (err) throw err;
		parserScope.fileName = fileName;
		parserScope.formatData(data,function(err,formattedData){
			parserScope.parseData(formattedData,function(err,questionData){
				db.initializeMongo(function (err) {
					if (err) throw err;
					parserScope.insertData(questionData,function(err,records){
						if (err) throw err;
						else if(records) {
							console.log(records.length + " records added!");
							callback(null);
						}
						else if (!records) {
							console.log("No records added.");
							callback(null);
						}
					});
				});
			});
		});
	});
};
parserScope.formatData = function(dataString, callback){
	dataString = dataString.replace(/\n/g," ").replace(/ROUND \d* /g,"").replace(/Round \d* Page \d* /g,"")
	dataString = dataString.replace(/High School Round \d* Page \d*/g,"").replace(/2002 Regional Science Bowl B Round \d* Page \d*/g,"").replace(/2007 Regional Science Bowl – Page \d*/g,"").replace(/\_*/g,""); //data normalization for legacy sets
	callback(null, dataString);
};
parserScope.parseData = function(dataString, callback){
	var delimiter = "DELIMITER_STRING_1234567890"
	dataString = dataString.replace(/TOSS-UP |BONUS /g, delimiter + "$&");
	qs = dataString.split(delimiter);
	qs.splice(0,1);
	var qsData = [];
	qs.forEach(function(q,qIndex){
		//console.log(qIndex); //For debugging only.
		var qSubject = q.match(/\d\) ([A-Z]| )*(M|S)/g)[0].replace(/\d\) /,"").toLowerCase(),
			qResponseType = (q.search(/Multiple Choice/i)!==-1) ? "mc" : "sa",
			qText = q.split(/Multiple Choice |Short Answer /i)[1].split("ANSWER: ")[0].trim(),
			qAnswer = q.split(/Multiple Choice |Short Answer /i)[1].split("ANSWER: ")[1].trim(),
			qQuestionType = (q.search(/TOSS-UP/)!==-1) ? "toss-up" : "bonus",
			qNum = qIndex + 1,
			qSource = parserScope.fileName;
		qSubject = qSubject.substring(0,qSubject.length-2).trim();
		qsData.push({"responseType":qResponseType,"subject":qSubject,"question":qText,"answer":qAnswer,"source":qSource,"number":qNum,"type":qQuestionType, "results":[]});
		if (qResponseType === "mc"){
			qsData[qIndex].question = qText.replace(/W\)|X\)|Y\)|Z\)/g,"\n$&");
		}
		switch(qsData[qIndex].subject){
			case "earth and space": case "astronomy": case "earth science": qsData[qIndex].normSubject = "es"; break;
			case "chemistry": qsData[qIndex].normSubject = "chem"; break;
			case "biology": qsData[qIndex].normSubject = "bio"; break;
			case "energy": qsData[qIndex].normSubject = "nrg"; break;
			case "math": qsData[qIndex].normSubject = "math"; break;
			case "physics": qsData[qIndex].normSubject = "phys"; break;
			case "general science": qsData[qIndex].normSubject = "gs-legacy"; break;
			case "computer Science": qsData[qIndex].normSubject = "cs-legacy"; break;
		}
	});
	callback(null, qsData);
};
parserScope.insertData = function(questions,callback){
	var questionsColl = db.docdb.collection('questionData');
	questionsColl.insert(questions,function(err,records){
		db.closeDb();
		callback(null,records);
	});
};