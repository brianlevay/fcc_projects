$('.removeRow').click(function(){
  if ($('.option').length > 2) {
    $('.option:last').remove();
  }
});

$('.addRow').click(function(){
  var prevName = $('.option:last').attr('name').split("_");
  var newName = "option_" + (parseInt(prevName[1]) + 1);
  $('.option:last').after(
    '<input class="option" type="text" name="' + newName + '" maxlength="25">'
  );
});

function validateForm() {
  var name = document.forms["create"]["pollname"].value;
  var opt1 = document.forms["create"]["option_1"].value;
  var opt2 = document.forms["create"]["option_2"].value;
  if (!name || !opt1 || !opt2 || name == "" || opt1 == "" || opt2 == "") {
    alert("Title and at least two options must be filled out");
    return false;
  } else {
    return true;
  }
}


