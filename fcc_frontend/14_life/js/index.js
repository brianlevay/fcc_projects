"use strict";

//// These are outside functions that are called to set states within React ////
//// This generates a random board state ////

function generateRandom(r, c) {
  var newBoardRandom = [];
  for (var i = 0; i < r; i++) {
    var row = [];
    for (var j = 0; j < c; j++) {
      var chance = Math.floor(Math.random() * 10);
      var stateVal = Math.floor(Math.random() * 2);
      if (chance < 7) {
        stateVal = 0;
      }
      row.push(stateVal);
    }
    newBoardRandom.push(row);
  }
  return newBoardRandom;
}

//// This performs a simulation time step ////

function simulateBoard(board, r, c) {
  var oldBoardSim = JSON.parse(JSON.stringify(board));
  var newBoardSim = JSON.parse(JSON.stringify(board));
  for (var i = 0; i < r; i++) {
    for (var j = 0; j < c; j++) {
      var minR = i - 1;
      var maxR = i + 1;
      var minC = j - 1;
      var maxC = j + 1;
      if (i === 0) {
        minR = r - 1;
      }
      if (i == r - 1) {
        maxR = 0;
      }
      if (j === 0) {
        minC = c - 1;
      }
      if (j == c - 1) {
        maxC = 0;
      }
      var sum = oldBoardSim[minR][minC] + oldBoardSim[minR][j] + oldBoardSim[minR][maxC] + oldBoardSim[i][minC] + oldBoardSim[i][maxC] + oldBoardSim[maxR][minC] + oldBoardSim[maxR][j] + oldBoardSim[maxR][maxC];

      if (oldBoardSim[i][j] === 1) {
        if (sum < 2) {
          newBoardSim[i][j] = 0;
        }
        if (sum > 3) {
          newBoardSim[i][j] = 0;
        }
      } else {
        if (sum == 3) {
          newBoardSim[i][j] = 1;
        }
      }
    }
  }
  return newBoardSim;
}

//// This is the root React class ////

var Game = React.createClass({
  displayName: "Game",

  getInitialState: function getInitialState() {
    return {
      board: generateRandom(50, 50),
      rows: 50,
      cols: 50,
      generation: 1,
      timerOn: false
    };
  },
  componentDidMount: function componentDidMount() {
    this.run();
  },
  setBoardSize: function setBoardSize(r, c) {
    clearInterval(this.simulateTimer);
    this.setState({ timerOn: false });
    var newBoardResized = generateRandom(r, c);
    this.setState({ rows: r, cols: c });
    this.setState({ board: newBoardResized });
    this.setState({ generation: 1 });
  },
  editCell: function editCell(event) {
    var cell = event.target;
    var classNames = cell.className.split(" ");
    var ij = classNames[2].split("-");
    var r = ij[0];
    var c = ij[1];
    var newBoardEdit = this.state.board.slice(0);
    if (newBoardEdit[r][c] === 0) {
      newBoardEdit[r][c] = 1;
    } else {
      newBoardEdit[r][c] = 0;
    }
    this.setState({ board: newBoardEdit });
  },
  run: function run() {
    if (this.state.timerOn === false) {
      this.setState({ timerOn: true });
      this.simulateTimer = setInterval(function () {
        var newBoardAdvance = simulateBoard(this.state.board, this.state.rows, this.state.cols);
        var generationAdvance = this.state.generation + 1;
        this.setState({ board: newBoardAdvance });
        this.setState({ generation: generationAdvance });
      }.bind(this), 1000);
    }
  },
  advance: function advance() {
    var newBoardAdvance = simulateBoard(this.state.board, this.state.rows, this.state.cols);
    var generationAdvance = this.state.generation + 1;
    this.setState({ board: newBoardAdvance });
    this.setState({ generation: generationAdvance });
  },
  stop: function stop() {
    clearInterval(this.simulateTimer);
    this.setState({ timerOn: false });
  },
  clear: function clear() {
    clearInterval(this.simulateTimer);
    this.setState({ timerOn: false });
    var newBoardClear = this.state.board.slice(0);
    for (var i = 0; i < this.state.rows; i++) {
      for (var j = 0; j < this.state.cols; j++) {
        newBoardClear[i][j] = 0;
      }
    }
    this.setState({ board: newBoardClear });
    this.setState({ generation: 1 });
  },
  reset: function reset() {
    clearInterval(this.simulateTimer);
    this.setState({ timerOn: false });
    var newBoardReset = generateRandom(this.state.rows, this.state.cols);
    this.setState({ board: newBoardReset });
    this.setState({ generation: 1 });
  },
  render: function render() {
    return React.createElement(
      "div",
      null,
      React.createElement(Controls, {
        run: this.run,
        advance: this.advance,
        stop: this.stop,
        clear: this.clear,
        reset: this.reset,
        generation: this.state.generation,
        rows: this.state.rows,
        timerOn: this.state.timerOn
      }),
      React.createElement(GameBoard, {
        board: this.state.board,
        rows: this.state.rows,
        cols: this.state.cols,
        editCell: this.editCell
      }),
      React.createElement(Setup, {
        setBoardSize: this.setBoardSize,
        rows: this.state.rows
      })
    );
  }
});

//// This is the React class for the control panel //// 

var Controls = React.createClass({
  displayName: "Controls",

  render: function render() {

    var panelSize = " mediumPanel";
    if (this.props.rows == 30) {
      panelSize = " smallPanel";
    }
    if (this.props.rows == 80) {
      panelSize = " largePanel";
    }
    var controlPanelClass = "controlPanel" + panelSize;

    var runActive = "";
    if (this.props.timerOn === true) {
      runActive = " active";
    }
    var runBtnClass = "controlBtn" + runActive;

    return React.createElement(
      "div",
      { className: controlPanelClass },
      React.createElement(
        "div",
        {
          className: runBtnClass,
          onClick: this.props.run
        },
        "Run"
      ),
      React.createElement(
        "div",
        {
          className: "controlBtn",
          onClick: this.props.advance
        },
        "Advance"
      ),
      React.createElement(
        "div",
        {
          className: "controlBtn",
          onClick: this.props.stop
        },
        "Stop"
      ),
      React.createElement(
        "div",
        {
          className: "controlBtn",
          onClick: this.props.clear
        },
        "Clear"
      ),
      React.createElement(
        "div",
        {
          className: "controlBtn",
          onClick: this.props.reset
        },
        "Reset"
      ),
      React.createElement(
        "div",
        {
          className: "generationCt"
        },
        "Generation: ",
        this.props.generation
      )
    );
  }
});

//// This is the React class for the game board ////

var GameBoard = React.createClass({
  displayName: "GameBoard",

  render: function render() {
    var boardDivs = [];
    for (var i = 0; i < this.props.rows; i++) {
      var row = [];
      for (var j = 0; j < this.props.cols; j++) {
        var classAssign = "cell s" + this.props.board[i][j] + " " + i + "-" + j;
        row.push(React.createElement("div", {
          className: classAssign
        }));
      }
      boardDivs.push(React.createElement(
        "div",
        null,
        row
      ));
    }

    var boardSize = " mediumBoard";
    if (this.props.rows == 30) {
      boardSize = " smallBoard";
    }
    if (this.props.rows == 80) {
      boardSize = " largeBoard";
    }
    var boardClass = "gameBoard" + boardSize;

    return React.createElement(
      "div",
      {
        className: boardClass,
        onClick: this.props.editCell.bind(this)
      },
      boardDivs
    );
  }
});

//// This is the React class for the setup panel ////

var Setup = React.createClass({
  displayName: "Setup",

  render: function render() {

    var panelSize = " mediumPanel";
    if (this.props.rows == 30) {
      panelSize = " smallPanel";
    }
    if (this.props.rows == 80) {
      panelSize = " largePanel";
    }
    var setupClass = "setupPanel" + panelSize;

    var mobileActive = "";
    var regularActive = " active";
    var largeActive = "";
    if (this.props.rows == 30) {
      mobileActive = " active";
      regularActive = "";
      largeActive = "";
    }
    if (this.props.rows == 80) {
      mobileActive = "";
      regularActive = "";
      largeActive = " active";
    }
    var mobileClass = "boardSizeBtn" + mobileActive;
    var regularClass = "boardSizeBtn" + regularActive;
    var largeClass = "boardSizeBtn" + largeActive;

    return React.createElement(
      "div",
      { className: setupClass },
      React.createElement(
        "div",
        { className: "boardSizes" },
        React.createElement(
          "div",
          {
            className: mobileClass,
            onClick: this.props.setBoardSize.bind(null, 30, 30)
          },
          "Mobile: 30x30"
        ),
        React.createElement(
          "div",
          {
            className: regularClass,
            onClick: this.props.setBoardSize.bind(null, 50, 50)
          },
          "Regular: 50x50"
        ),
        React.createElement(
          "div",
          {
            className: largeClass,
            onClick: this.props.setBoardSize.bind(null, 80, 80)
          },
          "Large: 80x80"
        )
      )
    );
  }
});

//// This renders the virtual DOM contents ////

ReactDOM.render(React.createElement(Game, null), document.getElementById('containerSect'));