/* This processes a new poll sent by POST and generates the JSON for storage */

function createJSONpoll(body) {
    var poll = {};
    var title = "";
    var options = [];
    for (var key in body) {
        var parts = key.split("_");
        if (key == "pollname") {
            title = body[key];
        } else if (parts[0] == "option" && body[key] != "") {
            var opt = body[key];
            var cleanOpt = opt.replace(/[<>]/g,'');
            options.push({ [cleanOpt]: 0 });
        }
    }
    if (title != "" && options.length >= 2) {
        poll.title = title;
        poll.options = options;
    }
    return JSON.stringify(poll);
}

/* This updates an existing poll sent via POST and generates the JSON for storage */

function updateJSONpoll(body) {
    var poll = {};
    var options = [];
    var selected = body.option;
    for (var key in body) {
        if (key != "pid" && key != "username" && key != "title" && key != "option" && 
            key != "CustomCt" && key != "CustomOption" && key != "__proto__") {
            options.push({ [key] : parseInt(body[key]) });
        }
    }
    poll.title = body.title;
    poll.options = options;
    if (selected == "Custom") {
        if (body["CustomOption"] != "") {
            poll.options.push({ [body["CustomOption"]] : 1 });
        }
    } else if (selected != "") {
        for (var i = 0; i < poll.options.length; i++) {
            var category = Object.keys(poll.options[i])[0];
            if (category == selected) {
                var newCt = parseInt(poll.options[i][selected]) + 1;
                poll.options[i][selected] = newCt;
            }
        }
    }
    return JSON.stringify(poll);
}

/* This makes the database method available */

module.exports = {
    createJSONpoll: createJSONpoll, 
    updateJSONpoll: updateJSONpoll
};
