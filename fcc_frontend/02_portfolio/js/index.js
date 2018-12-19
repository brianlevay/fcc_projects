/////////////////////////////////////////
// This function is called using <a>
// elements to link to other parts of 
// the page.  It figures out the position
// within the "main-section" that it
// needs to go to based on the heights
// of the interior rows.
/////////////////////////////////////////

function scrollSection(sectnum) {
  var margin = 5;
  var aboutHeight = $("#about-section").height();
  var portfolioHeight = $("#portfolio-section").height();
  var shift = 0;
  
  if (sectnum == 1) {
    shift = 0;
  } else if (sectnum == 2) {
    shift = (3*margin) + aboutHeight;
  } else if (sectnum == 3) {
    shift = (6*margin) + aboutHeight + portfolioHeight;
  } else {
    shift = 0;
  }
  
  $("#main-section").scrollTop(shift);
}

/////////////////////////////////////////
// This function shows and hides <div>
// elements in the nav-bar based on the
// window width
////////////////////////////////////////

function navBar() {
  if ($(window).width() <= 950) {	
      $("#extra-nav-col").show();
      $("#left-nav-col").hide();
      $("#mid-nav-col").addClass("col-xs-8");
      $("#mid-nav-col").removeClass("col-xs-6");
      $("#right-nav-col").hide();
   } else {
      $("#extra-nav-col").hide();
      $("#left-nav-col").show();
      $("#mid-nav-col").addClass("col-xs-6");
      $("#mid-nav-col").removeClass("col-xs-8");
      $("#right-nav-col").show();
   }
};

$(document).ready(navBar);
$(window).resize(navBar);

///////////////////////////////////////////