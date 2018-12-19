// This function sets the background color by randomly selecting rgb values from a subset of values //

function setColor () {
  var r = Math.floor(Math.random()*156)+100;
  var g = Math.floor(Math.random()*156)+100;
  var b = Math.floor(Math.random()*156)+100;
  var rgb = "rgb(" + r + "," + g + "," + b + ")"
  $("body").css("background-color", rgb);
}

// This section contains all of the code that's run while the page is up //

$("document").ready( function() {
  
  // The background color is set initially //
  
  setColor();
  
  // This section contains the API request. It collects 20 random quotes and stores them in "quoteArray", in order to avoid having to call the server each time the visitor wants a new quote. During the initial call, the first quote is put onto the page. //
  
  var quoteArray = [];
  
  $.getJSON("http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=20&callback=", function(json) {
    for (var i = 0; i < 20; i++) {
      quoteArray.push([json[i].content, json[i].title]);
    }
    var num = Math.floor(Math.random()*20);
    $("#quote").html(quoteArray[num][0]);
    $("#author").html(quoteArray[num][1]);
  });
  
  // This section then updates the quote by randomly selecting one from the existing array. It also updates the background color at the same time //
  
  $("#new-quote").on('click', function() {
    var num = Math.floor(Math.random()*20);
    $("#quote").html(quoteArray[num][0]);
    $("#author").html(quoteArray[num][1]);
    setColor();
  });
  
  // This section reads whatever quote is on the page and sends it to Twitter //

  $("#tweet-quote").on('click', function() {
    var addConst = "https://twitter.com/intent/tweet?hashtags=quotes&related=freecodecamp&text=";
    var quoteText = $("#quote").text().trim();
    var quoteAuthor = $("#author").text().trim();
    var tweetString = encodeURI('"' + quoteText + '" -' + quoteAuthor);
    var address = addConst + tweetString;
    window.open(address,'_blank');
  });
  
});