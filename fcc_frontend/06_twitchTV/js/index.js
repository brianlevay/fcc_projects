//// List of users specified by FCC ////

var users = ["ESL_SC2", "OgamingSC2", "cretetion", "freecodecamp", "storbeck", "habathcx", "RobotCaleb", "noobs2ninjas", "brunofin", "comster404"];
var namedCalls = 0;

//// This is the API function for getting featured streams ////

function getFeatured() {
  $.getJSON('https://api.twitch.tv/kraken/streams/featured?limit=5&callback=?', function(data) {
    var postFeatured = document.getElementById("featured");
    var entryString = "";
    for (var i = 0; i < 5; i++) {
      entryString = '<div class="featured-entry entry"><a class="entry-link" href="' + data.featured[i].stream.channel.url + '" target="_blank"><span class="image"><img class="logo" src="' + data.featured[i].stream.channel.logo + '"></span><span class="name">' + data.featured[i].stream.channel.display_name + '</span><span class="game">' + data.featured[i].stream.game + '</span></a></div>';
      postFeatured.innerHTML += entryString;
    }
  });
}

getFeatured();

//// This is the API function for getting the user info (logo and whether they exist), regardless of whether they are online ////

function getNamed(name) {
  $.getJSON('https://api.twitch.tv/kraken/channels/' + name + '?callback=?', function(data) {
    var postNamed = document.getElementById("named");
    var entryString = "";
    if (data.display_name) {
      entryString = '<div id="' + name + '" class="offline-entry entry"><a class="entry-link" href="' + data.url + '" target="_blank"><span class="image"><img class="logo" src="' + data.logo + '"></span><span class="name">' + data.display_name + '</span><span id=' + name + '-game class="game">Offline</span></a></div>';
    } else {
       entryString = '<div id="' + name + '" class="no-entry entry"><a class="entry-link" href="https://www.twitch.tv/" target="_blank"><span class="image"></span><span class="name">' + name + '</span><span id=' + name + '-game class="game">No Account</span></a></div>';
    }
    postNamed.innerHTML += entryString;
    if (data.display_name) {
      changeNamedCalls(1);
      getStream(name);
    }
    changeNamedCalls(-1);
  });
}

//// This is the API function for finding out whether a user is online and what game are they showing. This is called within the getNamed() callback function at the very end, after the DOM elements have been created, and is only called if the user exists. ////

function getStream(name) {
  $.getJSON('https://api.twitch.tv/kraken/streams/' + name + '?callback=?', function(data) {
    var targetEntry = document.getElementById(name);
    var targetGame = document.getElementById(name + "-game");
    if (data.stream) {
      targetGame.innerHTML = data.stream.game;
      targetEntry.className = "online-entry entry";
    }
    changeNamedCalls(-1);
  });
}

//// This changes the ajax counter up or down, and it fires the sorting function when the counter reaches 0. Because the if-statement is placed after the value change, this should only be triggered when all fired ajax calls are finished.  It shouldn't fire on the initial variable value of 0. ////

function changeNamedCalls(num) {
  namedCalls += num;
  if (namedCalls === 0) {
    sortNamed();
  }
}

//// This sorts the named divs ////

function sortNamed() {
  var postNamed = document.getElementById("named"); 
  var entryArr = [];
  var gameStr = "";
  var nameStr = "";
  var entryStr = "";
  var divCt = 0;
  for (var i = 0; i < postNamed.childNodes.length; i++) {
    if (postNamed.childNodes[i].nodeType === 1) {
      if (divCt !== 0) {
        gameStr = postNamed.childNodes[i].childNodes[0].childNodes[2].innerHTML; 
        nameStr = postNamed.childNodes[i].childNodes[0].childNodes[1].innerHTML;  
        entryStr = postNamed.childNodes[i].outerHTML;
        entryArr.push([gameStr, nameStr, entryStr]);
      }
      divCt += 1;
    }
  }
  entryArr.sort(function(a,b){
    var aTest = 0;
    var bTest = 0;
    if (a[0] == "Offline") {aTest = 1;}
    if (a[0] == "No Account") {aTest = 2;}
    if (b[0] == "Offline") {bTest = 1;}
    if (b[0] == "No Account") {bTest = 2;}
    if (aTest != bTest) {
      return aTest-bTest;
    } else {
      if (a[1].toLowerCase() < b[1].toLowerCase()) {
        return -1;
      } else {
        return 1;
      }
    }
  });
  divCt = 0;
  for (var i = 0; i < postNamed.childNodes.length; i++) {
    if (postNamed.childNodes[i].nodeType === 1) {
      if (divCt !== 0) {
        $(postNamed.childNodes[i]).replaceWith(entryArr[divCt-1][2]);
      }
      divCt += 1;
    }
  }
}

//// This function fires the initial higher-level ajax calls for all users ////

function getUsers() {
  for (var i = 0; i < users.length; i++) {
    changeNamedCalls(1);
    getNamed(users[i]);
  }
}

getUsers();

//// End of script ////