// variable initialization //

var minOrig = 25;
var secLOrig = 0;
var secROrig = 0;
var min = minOrig;
var secL = secLOrig;
var secR = secROrig;
var timerDiv = document.getElementById("timer");
var progressDiv = document.getElementById("progress-bar");
var completedDiv = document.getElementById("completed");
var remainingDiv = document.getElementById("remaining");
var timerCall;
var flashCall;
var flashCount;
var currStyle;

// run initialization on screen and counter variables //

initialize();

function initialize () {
  min = minOrig;
  secL = secLOrig;
  secR = secROrig;
  timerDiv.innerHTML = min + ":" + secL + secR;
  progressBar(0);
}

// functions call by buttons to modify timer //

function addMinutes () {
  minOrig += 1;
  initialize();
}

function removeMinutes () {
  if (minOrig > 0) {
    minOrig -= 1;
  }
  initialize();
}

function addSeconds() {
  if (secROrig < 9) {
    secROrig += 1;
  } else {
    secROrig = 0;
    if (secLOrig < 5) {
      secLOrig += 1;
    } else {
      secLOrig = 0;
    }
  }
  initialize();
}

function removeSeconds() {
  if (secROrig > 0) {
    secROrig -= 1;
  } else {
    secROrig = 9;
    if (secLOrig > 0) {
      secLOrig -= 1;
    } else {
      secLOrig = 5;
    }
  }
  initialize();
}

// functions called by the control buttons //

function startTimer () {
  timerCall = setInterval(countDown, 1000);
}

function pauseTimer () {
  clearInterval(timerCall);
}

function resetTimer () {
  pauseTimer();
  initialize();
}

// this is the counter function //

function countDown () {
  if (secR > 0) {
    secR -= 1;
  } else if (secL > 0) {
    secL -= 1;
    secR = 9;
  } else if (min > 0) {
    min -= 1;
    secL = 5;
    secR = 9;
  }
  timerDiv.innerHTML = min + ":" + secL + secR;
  if (min === 0 && secL === 0 && secR === 0) {
    clearInterval(timerCall);
    flashScreen();
  }
  calcProgress();
}

// this figures out the percentage of time that has passed //

function calcProgress () {
  var progress = 0;
  var totalOrig = minOrig*60 + secLOrig*10 + secROrig;
  var totalCurrent = min*60 + secL*10 + secR;
  progress = (totalOrig - totalCurrent) / totalOrig;
  progressBar(progress);
}

// this modifies the div widths to make the progress bar //

function progressBar (progress) {
  var compWidth = progress*90;
  var remWidth = (1-progress)*90;
  completedDiv.style.width = compWidth + "%";
  remainingDiv.style.width = remWidth + "%";
}

// this calls the screen flash on a timer //

function flashScreen () {
  flashCount = 0;
  currStyle = progressDiv.style.backgroundColor;
  flashCall = setInterval(flash, 500);
}

// this modifies the div color to make the screen flash //
// it also ends the parent timer when the count reaches the target //

function flash () {
  flashCount += 1;
  if (flashCount % 2 !== 0) {
    progressDiv.style.backgroundColor = "white";
  } else {
    progressDiv.style.backgroundColor = currStyle;
  }
  if (flashCount > 10) {
    clearInterval(flashCall);
    progressDiv.style.backgroundColor = currStyle;
  }
}