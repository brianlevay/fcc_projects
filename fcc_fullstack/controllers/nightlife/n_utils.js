/* This does a bit of data organization prior to sending the JSON response for who's going to the bars */
/* list: [{ id: bar_id, going: [["user","date"], ...] }, ...] */

function processGoing(barList,result) {
	var list = [];
	for (var i=0, lenI=barList.length; i<lenI; i++) {
		var going = [];
		for (var j=0, lenJ=result.length; j<lenJ; j++) {
			if (result[j].bar_id == barList[i]) {
				going.push([result[j].username,result[j].utcdate]);
			}
		}
		list.push({id: barList[i], going: going });
	}
  return list;
}

/* This makes the database method available */

module.exports = {
  processGoing: processGoing
};