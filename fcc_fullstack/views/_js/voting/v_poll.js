/* This builds the bar chart based on form data */

function makeChart() {
  var total = 0;
  $(".count").each(function(index, elem) {
    var val = parseInt($(elem).val());
    total += val;
  });
  $(".count").each(function(index, elem) {
    var val = parseInt($(elem).val());
    var bar = $(elem).prev().children().first();
    var size = 0;
    if (total > 0) {size = 100*(val / total);}
    if (size === 0) {size = 1;}
    var left = (100-size) + "%";
    bar.css({left: left});
  });
}

/* This confirms if a user wants to delete a poll */

function askDelete() {
  var answer = confirm("Are you sure you want to delete this poll?");
  if (answer === true) {return true;} else {return false;}
}

/* This validates the form data */

function validateForm() {
  var checked = $('.check').serialize();
  var custom = $('.custom').val();
  if (checked) {
    var selected = checked.split("=")[1].replace("+"," ");
    if (selected == "Custom") {
      if (custom != "") {
        return true;
      } else {
        alert("Please enter your custom option");
        return false;
      }
    } else {
      return true;
    }
  } else {
    alert("Please make a selection.");
    return false;
  }
}

/* This section reads whatever quote is on the page and sends it to Twitter */

$("#twitterBtn").on('click', function() {
  var addConst = "https://twitter.com/intent/tweet?text=";
  var text = "Check out this fun poll! ";
  var link = document.location.href;
  var address = addConst + encodeURI(text + link);
  window.open(address,'_blank');
});

$(document).ready(makeChart())

/* End of script */