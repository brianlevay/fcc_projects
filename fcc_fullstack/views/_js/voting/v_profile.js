/* This confirms if a user wants to delete a poll */

function askDelete() {
  var answer = confirm("Are you sure you want to delete this poll?");
  if (answer === true) {return true;} else {return false;}
}
