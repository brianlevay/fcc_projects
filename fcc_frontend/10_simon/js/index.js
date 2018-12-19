//////////////////////////////////////////////////////////////
/// Global variable declarations ///
//////////////////////////////////////////////////////////////

var audio1 = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound1.mp3');
var audio2 = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound2.mp3');
var audio3 = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound3.mp3');
var audio4 = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound4.mp3');

var greenBtn = document.getElementById("green");
var redBtn = document.getElementById("red");
var yellowBtn = document.getElementById("yellow");
var blueBtn = document.getElementById("blue");
var startBtn = document.getElementById("start-btn");
var strictBtn = document.getElementById("strict-btn");

var strict = false;
var playerMoves = [];
var compMoves = [];
var counter = 1;

//////////////////////////////////////////////////////////////
/// Button press functions defined ///
//////////////////////////////////////////////////////////////

function greenBtnPress () {
  audio1.play();
  $(greenBtn).css('backgroundColor','#00ff00');  // 50% on lightness //
  setTimeout(function(){$(greenBtn).css('backgroundColor','green');}, 300);
}

function redBtnPress () {
  audio2.play();
  $(redBtn).css('backgroundColor','#ff3333');  // 60% on lightness //
  setTimeout(function(){$(redBtn).css('backgroundColor','#b30000');}, 300);
}

function yellowBtnPress () {
  audio3.play();
  $(yellowBtn).css('backgroundColor','#ffff00');  // 50% on lightness //
  setTimeout(function(){$(yellowBtn).css('backgroundColor','#b3b300');}, 300);
}

function blueBtnPress () {
  audio4.play();
  $(blueBtn).css('backgroundColor','#3333ff');  // 60% on lightness //
  setTimeout(function(){$(blueBtn).css('backgroundColor','#0000b3');}, 300);
}

function startBtnPress () {
  $(startBtn).css('backgroundColor','#00ff00');  // 50% on lightness //
  $(startBtn).css('borderWidth','1.4vw');
  setTimeout(function(){$(startBtn).css('backgroundColor','green');}, 300);
  setTimeout(function(){$(startBtn).css('borderWidth','1.2vw');}, 300);
  /// Start game here! ///
  playerMoves = [];
  compMoves = getCompMoves();
  counter = 1;
  compPlay();
}

function strictBtnPress () {
  if (strict === false) {
    $(strictBtn).css('backgroundColor','red');  // 50% on lightness //
    $(strictBtn).css('borderWidth','1.4vw');
    $(strictBtn).children().html("ON");
    strict = true;
  } else {
    $(strictBtn).css('backgroundColor','yellow');  // 50% on lightness //
    $(strictBtn).css('borderWidth','1.2vw');
    $(strictBtn).children().html("OFF");
    strict = false;
  }
}

//////////////////////////////////////////////////////////////
/// Game function ///
//////////////////////////////////////////////////////////////

/// Key considerations: 
/// 1. User response must be correct and must be under time limit 
/// 2. Computer's tempo varies, slowest for moves 1-5, faster for 6-9, faster still for 10-13, then fastest 14+ 

function getCompMoves () {
  var moves = []
  var num = 0;
  for (var n = 0; n < 20; n++) {
    num = Math.floor(Math.random()*4)+1;
    moves.push(num);
  }
  return moves;
}

function showCompMove (move) {
  switch (move) {
    case 1:
      greenBtnPress();
      break;
    case 2:
      redBtnPress();
      break;
    case 3:
      yellowBtnPress();
      break;
    case 4:
      blueBtnPress();
      break;
  }
}

function showWin () {
  setTimeout(function(){
    $(greenBtn).css('backgroundColor','#00ff00');  // 50% on lightness //
    setTimeout(function(){$(greenBtn).css('backgroundColor','green');}, 300);
  }, 600);
  setTimeout(function(){
    $(redBtn).css('backgroundColor','#ff3333');  // 60% on lightness //
    setTimeout(function(){$(redBtn).css('backgroundColor','#b30000');}, 300);
  }, 1000);
  setTimeout(function(){
    $(blueBtn).css('backgroundColor','#3333ff');  // 60% on lightness //
    setTimeout(function(){$(blueBtn).css('backgroundColor','#0000b3');}, 300);
  }, 1400);
  setTimeout(function(){
    $(yellowBtn).css('backgroundColor','#ffff00');  // 50% on lightness //
    setTimeout(function(){$(yellowBtn).css('backgroundColor','#b3b300');}, 300);
  }, 1800);
  setTimeout(function(){
    $(greenBtn).css('backgroundColor','#00ff00');  // 50% on lightness //
    setTimeout(function(){$(greenBtn).css('backgroundColor','green');}, 300);
    $(redBtn).css('backgroundColor','#ff3333');  // 60% on lightness //
    setTimeout(function(){$(redBtn).css('backgroundColor','#b30000');}, 300);
    $(yellowBtn).css('backgroundColor','#ffff00');  // 50% on lightness //
    setTimeout(function(){$(yellowBtn).css('backgroundColor','#b3b300');}, 300);
    $(blueBtn).css('backgroundColor','#3333ff');  // 60% on lightness //
    setTimeout(function(){$(blueBtn).css('backgroundColor','#0000b3');}, 300);
    audio3.play();
  }, 2200);
  $("#ct-tot").html("--");
}

function showLose () {
  setTimeout(function(){
    $(greenBtn).css('backgroundColor','#00ff00');  // 50% on lightness //
    setTimeout(function(){$(greenBtn).css('backgroundColor','green');}, 300);
    $(redBtn).css('backgroundColor','#ff3333');  // 60% on lightness //
    setTimeout(function(){$(redBtn).css('backgroundColor','#b30000');}, 300);
    $(yellowBtn).css('backgroundColor','#ffff00');  // 50% on lightness //
    setTimeout(function(){$(yellowBtn).css('backgroundColor','#b3b300');}, 300);
    $(blueBtn).css('backgroundColor','#3333ff');  // 60% on lightness //
    setTimeout(function(){$(blueBtn).css('backgroundColor','#0000b3');}, 300);
    audio1.play();
  }, 300);
  $("#ct-tot").html("--");
}

function compPlay () {
  $("#ct-tot").html(counter);
  var n = 0;
  var move = 0;
  var delay = 1000;
  if (counter >= 14) {delay = 400;}
  else if (counter >= 10) {delay = 600;}
  else if (counter >= 6) {delay = 800;}
  var playTimer = setInterval(function() {
    move = compMoves[n];
    showCompMove(move);
    n++;
    if (n >= counter) {
      clearInterval(playTimer);
      playerListen();
    }
  }, delay);
}

function playerListen () {
  playerMoves = [];
  var timeAllowCt1 = 5000;
  var timeAllowCt20 = 20000;
  var timeAllowSlope = (timeAllowCt20-timeAllowCt1)/(20-1);
  var maxTimeAllow = timeAllowSlope * (counter-1) + timeAllowCt1;
  var numTimeSteps = 5;
  var checkTimeStep = maxTimeAllow / numTimeSteps;
  var timeStepCt = 0;
  
  var checkTimer = setInterval(function() {
    var allEntered = false;
    var allCorrect = false;
    var numCorrect = 0;
    timeStepCt += 1;
    
    if (playerMoves.length == counter) {
      allEntered = true;
      for (var n = 0; n < counter; n++) {
        if (playerMoves[n] == compMoves[n]) {numCorrect += 1;}
      }
      if (numCorrect == counter) {allCorrect = true;}
    }
    
    if (allEntered === true) {
      if (allCorrect === true) {
        counter += 1;
        if (counter < 20) {compPlay();}
        else {showWin();} ///// win here! /////
        clearInterval(checkTimer);
      } else {
        if (strict === false) {
          showLose();
          $("#ct-tot").html(counter);
          compPlay();
        } 
        else {showLose();} ///// lose here! /////
        clearInterval(checkTimer);
      }
    } 
    
    if (timeStepCt == numTimeSteps) {
      if (strict === false) {
        showLose();
        $("#ct-tot").html(counter);
        compPlay();
      } 
      else {showLose();} ///// lose here! /////
      clearInterval(checkTimer);
    }
    
  }, checkTimeStep);
  
}

//////////////////////////////////////////////////////////////
/// Button press functions bound to click events ///
//////////////////////////////////////////////////////////////

$(greenBtn).click(function(){
  greenBtnPress();
  playerMoves.push(1);
})

$(redBtn).click(function(){
  redBtnPress();
  playerMoves.push(2);
})

$(yellowBtn).click(function(){
  yellowBtnPress();
  playerMoves.push(3);
})

$(blueBtn).click(function(){
  blueBtnPress();
  playerMoves.push(4);
})

$(startBtn).click(function(){
  startBtnPress();
})

$(strictBtn).click(function(){
  strictBtnPress();
})

//////////////////////////////////////////////////////////////