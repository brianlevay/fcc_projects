// NOTES: This Tic-Tac-Toe game was originally designed with a "minmax" algorithm that solved forward a certain number of steps that varied by difficulty.  However, the harder games ended up have a long pause for calculations, and the minmax (when crippled to allow some fun), felt like it was vastly over-engineered for almost no experience improvement.  The approach used in this implementation uses a much more pragmatic approach, based exclusively on the next move.  The computer prioritizes the following moves, but randomness (decided by difficulty level), may cause the computer to skip a step: (1) win, (2) block a win, (3) follow a set of "rules" recommended by experienced players, (4) randomly fill in a cell. In the future, I would like to implement the minmax using a full-stack arrangement, to improve performance. //

// Global variable declaration //
var mapToPos = {"tl":0,"tm":1,"tr":2,"ml":3,"mm":4,"mr":5,"bl":6,"bm":7,"br":8};
var mapToId = {0:"tl",1:"tm",2:"tr",3:"ml",4:"mm",5:"mr",6:"bl",7:"bm",8:"br"};
var board = [0,0,0,0,0,0,0,0,0];
var difficulty = "easy";
var playerSymbol = "X";
var compSymbol = "O";
var cellColor = document.getElementById("tl").style.backgroundColor;
var playerAllow = false;
var moves = 0;

// This is a generic function for determining which radio button is checked and returning its value //
function getRadio (form, radio_name) {
  var radioLoc = document.forms[form].elements[radio_name];
  for (var i = 0; i < radioLoc.length; i++) {
    if (radioLoc[i].checked) {
      return radioLoc[i].value;
    }
  }
}

// This function uses getRadio to get the difficulty //
function getDifficulty () {
  difficulty = getRadio(0,"difficulty");
}

// This function uses getRadio to get the symbols for player and computer (and therefore who starts) //
function getSymbol () {
  playerSymbol = getRadio(1,"symbol");
  if (playerSymbol == "X") {
    compSymbol = "O";
  } else {
    compSymbol = "X";
  }
}

// This function performs a move for the player //
// The function checks if the move is allowed, changes the "board", draws the new symbol, and checks for a win or draw //
// If the game hasn't been won or ended in a draw, it calls compMove() //
function playerMove (cell) {
  if (playerAllow === true) {
    var id = cell.id;
    var pos = mapToPos[id];
    if (board[pos] === 0) {
      board[pos] = 1;
      moves += 1;
      $(cell).children().html(playerSymbol.toUpperCase());
      $(cell).css('backgroundColor','white');
      playerAllow = false;
      var scoreExt = checkBoard(board,"a");
      if (scoreExt[0] > 0) {
        winningMoves();
        $("#outcome-txt").html("You Win!");
        $("#outcome").css('visibility','visible');
      } else if (moves == 9) {
        setTimeout(function(){$(cell).css('backgroundColor',cellColor)}, 200);
        $("#outcome-txt").html("Draw!");
        $("#outcome").css('visibility','visible');
      } else {
        setTimeout(function(){$(cell).css('backgroundColor',cellColor)}, 200);
        compMove();
      }
    }
  }
}

// This function performs a move for the computer //
// The function runs the AI to choose the next position, then updates the board and display and checks for win and draw //
// If the game hasn't been won or ended in a draw, it allows the next playerMove //
function compMove () {
  var pos = compAI();
  var id = mapToId[pos];
  var cell = document.getElementById(id);
  board[pos] = -1;
  moves += 1;
  $(cell).children().html(compSymbol.toUpperCase());
  $(cell).css('backgroundColor','white');
  var scoreExt = checkBoard(board,"a");
  if (scoreExt[1] > 0) {
    winningMoves();
    $("#outcome-txt").html("You Lose!");
    $("#outcome").css('visibility','visible');
  } else if (moves == 9) {
    setTimeout(function(){$(cell).css('backgroundColor',cellColor)}, 200);
    $("#outcome-txt").html("Draw!");
    $("#outcome").css('visibility','visible');
  } else {
    setTimeout(function(){$(cell).css('backgroundColor',cellColor)}, 200);
    playerAllow = true;
  }
}

// This is the function that checks for a win or loss by counting the number of combos full of +1s and -1s //
function checkBoard(board, selection) {
  var search = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  var plusOneCt = 0;
  var minusOneCt = 0;
  var searchLoc = 0;
  var fullPlusCt = 0;
  var fullMinusCt = 0;
  var outputCts = [0,0];
  var winningCells = [0,0,0];
  
  for (var i = 0; i < 8; i++) {
    plusOneCt = 0;
    minusOneCt = 0;
    for (var j = 0; j < 3; j++) {
      searchLoc = search[i][j];
      if (board[searchLoc] == 1) {plusOneCt += 1;}
      if (board[searchLoc] == -1) {minusOneCt += 1;}
    }
    if (plusOneCt == 3 || minusOneCt == 3) {
      for (var j = 0; j < 3; j++) {
        searchLoc = search[i][j];
        winningCells[j] = searchLoc;
      }
    }
    if (plusOneCt == 3) {fullPlusCt += 1;}
    if (minusOneCt == 3) {fullMinusCt += 1;}
  }
  // OutputCts is # of combos full of +1 (player wins) and # full of -1 (comp wins) //
  outputCts = [fullPlusCt, fullMinusCt];
  
  if (selection == "a") {return outputCts;}
  if (selection == "b") {return winningCells;}
}

// This is the AI function that chooses the next computer move //
function compAI () {
  var pos = 0;
  var posWin = -1;
  var posBlock = -1;
  var posDet = -1;
  var posRand = -1;
  var boardTestWin = [];
  var boardTestBlock = [];
  var scoreTestWin = [];
  var scoreTestBlock = [];
  
  // This section determines if there is a winning move for the computer and sets posWin to that location //
  // It also determines if there is a winning move for the player and sets posBlock to that location //
  for (var i = 0; i < 9; i++) {
    if (board[i] === 0) {
      boardTestWin = board.slice(0);
      boardTestWin[i] = -1;
      scoreTestWin = checkBoard(boardTestWin,"a");
      if (scoreTestWin[1] > 0) {
        posWin = i;
      }
    }
    if (board[i] === 0) {
      boardTestBlock = board.slice(0);
      boardTestBlock[i] = 1;
      scoreTestBlock = checkBoard(boardTestBlock,"a");
      if (scoreTestBlock[0] > 0) {
        posBlock = i;
      }
    }
  }
  
  // This determines the best next "deterministic" move, ignoring forks, based on Newell and Simon (Wikipedia) //
  if (moves === 0) {posDet = 0;} // if it's the first move of the game, choose the corner //
  else if (board[4] === 0) {posDet = 4;} // choose center //
  else if (board[0] === 1 && board[8] === 0) {posDet = 8;}  // choose opposite corner //
  else if (board[8] === 1 && board[0] === 0) {posDet = 0;}  // choose opposite corner //
  else if (board[2] === 1 && board[6] === 0) {posDet = 6;}  // choose opposite corner //
  else if (board[6] === 1 && board[2] === 0) {posDet = 2;}  // choose opposite corner //
  
  // This randomly selects an open cell //
  var filled = true;
  if (moves < 9) {
    while (filled === true) {
      posRand = Math.floor(Math.random()*9);
      if (board[posRand] === 0) {
        filled = false;
      }
    }
  }
  
  // This section chooses what move to make based on the selected difficulty //
  // Moves are chosen in descending order: win, block, deterministic, or random //
  // If a win is available, the computer will choose it some fraction of the time //
  // If a win isn't available or chosen, and if a block is available, the computer will choose it some fraction of the time //
  // If a block isn't available or chosen, the computer will determine an appropriate deterministic response... // 
  // Finally, if nothing else is chosen, the computer will chose a space randomly //
  var chooseWin = 0.50;
  var chooseBlock = 0.50;
  var chooseDet = 0.50;
  var randWin = Math.random();
  var randBlock = Math.random();
  var randDet = Math.random();
  if (difficulty == "medium") {
    chooseWin = 0.65;
    chooseBlock = 0.65;
    chooseDet = 0.65;
  }
  else if (difficulty == "hard") {
    chooseWin = 1.00;
    chooseBlock = 1.00;
    chooseDet = 1.00;
  }
  if (posWin != -1 && randWin < chooseWin) {
    pos = posWin;
  } else if (posBlock != -1 && randBlock < chooseBlock) {
    pos = posBlock;
  } else if (posDet != -1 && randDet < chooseDet) {
    pos = posDet;
  } else {
    pos = posRand;
  }
  
  return pos;
}

// This calls playerMove when any cell is clicked //
$(".cell").click(function() {
  var cell = this;
  playerMove(cell);
});

// This gets the state from the start screen and then hides it //
// It either allows to player to move, or it calls compMove depending on the symbols //
$("#start-btn").click(function() {
  getDifficulty();
  getSymbol();
  $("#new-game").css('visibility', 'hidden');
  if (playerSymbol == "X") {
    playerAllow = true;
  } else {
    compMove();
  }
});

// This clears the board and brings the start menu back when you click on the result board //
$("#outcome").click(function() {
  var id;
  var cell;
  for (var i = 0; i < 9; i++) {
    board[i] = 0;
    id = mapToId[i];
    cell = document.getElementById(id);
    $(cell).children().html("");
    $(cell).css('backgroundColor',cellColor);
  }
  moves = 0;
  $("#outcome").css('visibility', 'hidden');
  $("#new-game").css('visibility', 'visible');
})

// This highlights winning cells before the results banner is shown //
function winningMoves () {
  var cellNums = checkBoard(board,"b");
  var id = "";
  var cell = document.getElementById("tl");
  for (var k = 0; k < 3; k++) {
    id = mapToId[cellNums[k]];
    cell = document.getElementById(id);
    $(cell).css('backgroundColor','white');
  } 
}
  
// End of script //