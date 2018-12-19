// Comments below //
// jQuery is enabled in the JS panel //
// The code in this section is very simple. It runs when the screen is resized. If the screen width falls below a threshold, it removes the left and right columns of the title row and the main text row. It then expands the remaining column to fill the entire page width. //

$(window).resize(function(){
	if ($(window).width() <= 800) {	
    $("#left-title-col").hide();
    $("#right-title-col").hide();
    $("#left-text-col").hide();
    $("#right-text-col").hide();
    $("#title-block").removeClass("col-xs-8");
    $("#title-block").addClass("col-xs-12");
    $("#main-text-block").removeClass("col-xs-10");
    $("#main-text-block").addClass("col-xs-12");
  } else {
    $("#left-title-col").show();
    $("#right-title-col").show();
    $("#left-text-col").show();
    $("#right-text-col").show();
    $("#title-block").removeClass("col-xs-12");
    $("#title-block").addClass("col-xs-8");
    $("#main-text-block").removeClass("col-xs-12");
    $("#main-text-block").addClass("col-xs-10");
  }
});