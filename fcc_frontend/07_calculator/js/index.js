// variable initialization //
var screenDiv = document.getElementById("screen");
var eqnDiv = document.getElementById("eqn");
var screen = "";
var numAllow = [true];
var negAllow = [true];
var decAllow = [true];
var operAllow = [false];
var leftParAllow = [true];
var rightParAllow = [false];
var parLevel = [0];
var resultAvail = false;

// this allows for re-initialization of the variables //
function initialize () {
  screen = "";
  numAllow = [true];
  negAllow = [true];
  decAllow = [true];
  operAllow = [false];
  leftParAllow = [true];
  rightParAllow = [false];
  parLevel = [0];
  resultAvail = false;
}

// gets the button values and chooses whether to allow them on the screen //
function getKey (value) {
  var addToScreen = "";
  if (value == "+" || value == "-" || value == "*" || value == "/" || value == "^") {
    if (operAllow[operAllow.length-1] === true) {
      addToScreen = " " + value + " ";
      numAllow.push(true);
      negAllow.push(false);
      decAllow.push(true);
      operAllow.push(false);
      leftParAllow.push(true);
      rightParAllow.push(false);
      parLevel.push(parLevel[parLevel.length-1]);
    }
  }
  if (value == "-") {
    if (negAllow[negAllow.length-1] === true) {
      addToScreen = value;
      numAllow.push(true);
      negAllow.push(false);
      decAllow.push(true);
      operAllow.push(false);
      leftParAllow.push(true);
      rightParAllow.push(false);
      parLevel.push(parLevel[parLevel.length-1]);
    }
  }
  if (value.charCodeAt(0) >= 48 && value.charCodeAt(0) <= 57) {
    if (numAllow[numAllow.length-1] === true) {
      addToScreen = value;
      numAllow.push(true);
      negAllow.push(false);
      decAllow.push(decAllow[decAllow.length-1]);
      operAllow.push(true);
      leftParAllow.push(false);
      rightParAllow.push(true);
      parLevel.push(parLevel[parLevel.length-1]);
    }
  }
  if (value == ".") {
    if (decAllow[decAllow.length-1] === true) {
      if (screen.length === 0) {
        addToScreen = "0" + value;
      } else if (screen.charCodeAt(screen.length-1) < 48 || screen.charCodeAt(screen.length-1) > 57) {
        addToScreen = "0" + value;
      } else {
        addToScreen = value;
      }
      numAllow.push(true);
      negAllow.push(false);
      decAllow.push(false);
      operAllow.push(true);
      leftParAllow.push(false);
      rightParAllow.push(true);
      parLevel.push(parLevel[parLevel.length-1]);
    }
  }
  if (value == "(") {
    if (leftParAllow[leftParAllow.length-1] === true) {
      addToScreen = value;
      numAllow.push(true);
      negAllow.push(true);
      decAllow.push(true);
      operAllow.push(false);
      leftParAllow.push(true);
      rightParAllow.push(false);
      parLevel.push(parLevel[parLevel.length-1]+1);
    }
  }
  if (value == ")") {
    if (rightParAllow[rightParAllow.length-1] === true) {
      if (parLevel[parLevel.length-1] > 0) {
        addToScreen = value;
        numAllow.push(false);
        negAllow.push(false);
        decAllow.push(false);
        operAllow.push(true);
        leftParAllow.push(false);
        rightParAllow.push(true);
        parLevel.push(parLevel[parLevel.length-1]-1);
      }
    }
  }
  return addToScreen;
}

function typeKey (value) {
  if (resultAvail === true) {
    if (value == "+" || value == "-" || value == "*" || value == "/" || value == "^") {
      resultAvail = false;
    } else {
      initialize();
      resultAvail = false;
    }
  }
  screen += getKey(value);
  screenDiv.innerHTML = screen;
}

// removes the last element in the string //
function undoChar () {
  var newStr = "";
  if (screen[screen.length-1] == " ") {
    newStr = screen.substring(0,screen.length-3);
  } else {
    newStr = screen.substring(0,screen.length-1);
  }
  screen = newStr;
  screenDiv.innerHTML = screen;
  numAllow.pop();
  negAllow.pop();
  decAllow.pop();
  operAllow.pop();
  leftParAllow.pop();
  rightParAllow.pop();
  parLevel.pop();
  resultAvail = false;
}

// clears the screen and resets all of the variables and flags //
function clearScr () {
  initialize();
  screenDiv.innerHTML = screen;
}

// solves the equation //
function solveEqn () {
  var i = 0;
  var j = 0;
  var k = 0;
  var n = 0;
  var input = [];
  var lvlCount = 0;
  var lvlMax = 0;
  var hasLeft = false;
  var hasRight = false;
  var valForRaw = "";
  var valForLvl = 0;
  var raw = [];
  var levels = [];
  var opOrder = ["^","/","*","-","+"];
  var tryAgain = true;
  var loopCount = 0;
  var newVal = 0;
  var result = 0;
  
  // this section finishes the equation on the screen if it's incomplete //
  screen = finishScreen();
  input = screen.split(" ");
  
  // this gets the string array, determines the nested level of operations, and removes parentheses //
  for (i = 0; i < input.length; i++) {
    hasLeft = false;
    hasRight = false;
    for (j = 0; j < input[i].length; j++) {
      if (input[i][j] == "(") {
        hasLeft = true;
        lvlCount += 1;
      }
      if (input[i][j] == ")") {
        hasRight = true;
        lvlCount -= 1;
      }
    }
    if (lvlCount > lvlMax) {
      lvlMax = lvlCount;
    }
    valForRaw = input[i];
    valForLvl = lvlCount;
    if (hasLeft === true) {
      valForRaw = valForRaw.replace(/\(*/g,"");
    }
    if (hasRight === true) {
      valForRaw = valForRaw.replace(/\)*/g,"");
      valForLvl = levels[i-1];
    }
    raw.push(valForRaw);
    levels.push(valForLvl);
  }
  
  // this turns the string numbers to actual numbers //
  for (i = 0; i < raw.length; i++) {
    if (raw[i].charCodeAt(0) >= 48 && raw[i].charCodeAt(0) <= 57) {
      raw[i] = parseFloat(raw[i]);
    }
  }
  
  // this solves the equation using order of operations within nested parentheses //
  for (n = lvlMax; n >= 0; n--) {
    for (k = 0; k < opOrder.length; k++) {
      for (i = 0; i < raw.length-2; i = i + 2) {
        tryAgain = true;
        loopCount = 0;
        while (tryAgain === true) {
          if ((levels[i+2] == levels[i]) && (levels[i] == n) && (raw[i+1] == opOrder[k])) {
            if (opOrder[k] == "^") {newVal = Math.pow(raw[i],raw[i+2]);}
            if (opOrder[k] == "/") {newVal = raw[i] / raw[i+2];}
            if (opOrder[k] == "*") {newVal = raw[i] * raw[i+2];}
            if (opOrder[k] == "-") {newVal = raw[i] - raw[i+2];}
            if (opOrder[k] == "+") {newVal = raw[i] + raw[i+2];}
            raw[i] = newVal;
            raw.splice(i+1,2);
            levels.splice(i+1,2);
          } else {
            tryAgain = false;
          }
          loopCount += 0;
          if (loopCount > 100) {break;}
        }
      }
    }
    for (i = 0; i < raw.length; i++) {
      if (levels[i] == n) {
        levels[i] -= 1;
      }
    }
  }
  result = raw[0];
  result = result.toString();
  
  // this writes the equation and result to the header //
  eqn.innerHTML = screen + " = " + result;
  
  // this writes the result to the screen and prepares the "key allowance" arrays so it can be used//
  initialize();
  for (i = 0; i < result.length; i++) {
    screen += getKey(result[i]);
  }
  screenDiv.innerHTML = screen;
  resultAvail = true;
}

// this function finishes the equation on the screen, if left unfinished //
function finishScreen () {
  var final = screen;
  if (final[final.length-1] == " ") {
    if (final[final.length-2] == "+" || final[final.length-2] == "-") {
      final += 0;
    }
    if (final[final.length-2] == "*" || final[final.length-2] == "/" || final[final.length-2] == "^") {
      final += 1;
    }
  }
  if (parLevel[parLevel.length-1] > 0) {
    for (i = parLevel[parLevel.length-1]; i > 0; i--) {
      final += ")";
    }
  }
  return final;
}