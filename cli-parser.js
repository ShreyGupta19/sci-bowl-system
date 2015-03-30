var parser = require("./parser.js");
var async = require("async");

var arguments = process.argv.slice(2);
async.eachSeries(arguments,function(fileName,callback){
	console.log(fileName);
	parser.parseRound(fileName, function(err){
		if (err) throw err;
		else {
			console.log(fileName + " has finished processing.");
			callback(null);
		}
	});
}, function(err){
	if (err) throw err;
	else console.log("All files processed!");
	process.exit();
});

