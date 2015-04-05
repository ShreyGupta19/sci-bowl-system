$(document).ready(function(){
	var getQuestion;
	var timerScope = {
		timerMax: 20000,
		step: 20,
		counter: 0, 
		stopFlag: false,
		start: (new Date()).getTime(),
		timeout:null,
		instance: function() {
			var real = (timerScope.counter * timerScope.step),
			ideal = (new Date().getTime() - timerScope.start);
			timerScope.updateUI(real);
			timerScope.counter++;
			var diff = (ideal - real);
			timerScope.timeout = window.setTimeout(function() {
				if(timerScope.stopFlag) {}
				else if(real < timerScope.timerMax) timerScope.instance(); 
				else {timerScope.timeout = null; timerScope.done();}
			}, (timerScope.step - diff));
		},
		updateUI: function(time) {
			var timeString = 
			$('#quiz-question').attr('data-time-left',((timerScope.timerMax-time)/1000).toFixed(2)+"");
		},
		done: function(){
			toggleUI("time-up");
		}, 
		reset: function(){
			timerScope.stopFlag = false;
			timerScope.timerMax = 0;
			timerScope.counter = 0;
			timerScope.start = (new Date()).getTime();
			timerScope.timeout = null;
		},
		stop: function(){
			timerScope.stopFlag = true;
		}
	};
	$("#correct-button").click(function(event) {
		submitPostReq(true);
	});
	$("#incorrect-button").click(function(event) {
		submitPostReq(false);
	});
	$("#continue-button").click(function(event) {
		submitPostReq(false);
	});
	var submitPostReq = function(type){
		var postReq = $.post("/quiz",{
			"qData":{
				"questionId":getQuestion()["_id"],
				"correct": type,
				"timeElapsed": timerScope.counter * timerScope.step,
				"timestamp":(new Date()).toISOString()
			},
			"type":"logQuestion"
		},'json').success(function(data){
        	toggleUI("hide");
        	submitGetReq();
		});
	};
	var submitGetReq = function(){
		var getReq = $.get("/quiz",{
			"type":"getRandomQuestion"
		},'json').success(function(data){
			console.log(data);
			getQuestion = function(){return data;};
			$("#quiz-question").html(data.question.replace(/\n/g,"<br/>"));
			$("#quiz-answer").html(data.answer);
			$("#quiz-question-categories").html(data.type + ", " + data.subject + ", " + data.responseType);
			var timeNeededToRead = data.question.length*38; //Average human reading rate is 300wpm = 1500 chars/min ~= 25 chars/sec. 1000ms/sec --> 1000/25 = 40 ms/char - ~2ms/char to compensate for spaces
			timerScope.reset();
			timerScope.timerMax = (data.type === "toss-up") ? 5000 + timeNeededToRead : 20000 + timeNeededToRead;
			timerScope.timeout = window.setTimeout(function() { timerScope.instance(); }, timerScope.step);
		});
	};
	var toggleUI = function(type){
		if(type==="hide"){
			$("#outcome-form-group").css("display","block");
			$("#time-up-form-group").css("display","none");
			$(".quiz-form").css("display","none");
			$("#buzz-button").css("display","inline-block");
		}
		else if (type==="show"){
			$(".quiz-form").css("display","block");
			$("#buzz-button").css("display","hidden");
		}
		else if (type==="time-up"){
			$("#buzz-button").css("display","hidden");
			$(".quiz-form").css("display","block");
			$("#outcome-form-group").css("display","none");
			$("#time-up-form-group").css("display","block");
		}
	}
	$("#buzz-button").click(function(){
		timerScope.stop();
		toggleUI("show");
	});
	submitGetReq();
});	