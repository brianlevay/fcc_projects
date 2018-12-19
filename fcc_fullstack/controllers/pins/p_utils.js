/* This converts the raw Postgres search results into an array of wall objects */
// Result rows = wall_id, wallname, username, pin_id (maybe NULL), image_url (maybe NULL), comment (maybe NULL) //
// wall = {wall_id: wall_id, wallname: wallname, username: username, pins: []}

function createWallArray(results) {
  var walls = [];
  results.sort(function(a,b){return parseInt(a.wall_id)-parseInt(b.wall_id);});
  var num = -1;
  var id_num, wallname, username;
  for (var i = 0, len = results.length; i < len; i++) {
    id_num = parseInt(results[i].wall_id);
    wallname = results[i].wallname;
    username = results[i].username;
    if (id_num != num) {
      walls.push({wall_id: id_num, wallname: wallname, username: username, pins: []});
      num = id_num;
    }
  }
  for (var n = 0, numwalls = walls.length; n < numwalls; n++) {
    var pins = filterPins(results, walls[n].wall_id);
    walls[n].pins = pins;
  }
  return walls;
}

/* This filters initial table-joined search results and returns an array of pin objects for a given wall_id */
// pin = {pin_id: pin_id, image_url: image_url, comment: comment}

function filterPins(results, wall_id) {
  var filtered = [];
  for (var i = 0, len = results.length; i < len; i++) {
    if (results[i].pin_id && results[i].wall_id === wall_id) {
      var pin = {pin_id: results[i].pin_id, image_url: results[i].image_url, comment: results[i].comment};
      filtered.push(pin);
    }
  }
  return filtered;
}

/* This makes the database method available */

module.exports = {
  createWallArray: createWallArray,
  filterPins: filterPins
};

