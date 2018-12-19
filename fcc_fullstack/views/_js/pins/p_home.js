"use strict";

/******************************************************************/
/* REACT CLASS STRUCTURE */
/******************************************************************/

//  PhotoApp       
//  ---  HomeTab (#/)
//  |    ---  WallSet [displays this.state.topWalls]
//	|					--- WallPreview
//	|							--- ViewPin
//  ---  UserTab (#/:username)
//  |    ---  CreateWall [if user = :username]
//	|    ---  WallSet [displays this.state.collection]
//	|					--- WallPreview
//	|							--- ViewPin
//  ---  WallTab (#/:username/:wall)
//       ---  AddPin [if user = :username]
//       ---  FullWall [displays this.state.wall]
//            --- ViewPin

// pin = {pin_id: pin_id, image_url: image_url, comment: comment}
// wall = {wall_id: wall_id, wallname: wallname, username: username, pins: []}
// collection = {username: username, walls: []}
// topWalls = {topCount: num, walls: []}

/******************************************************************/
/* [0] < BOOK APP /> - ROOT REACT CLASS */
/******************************************************************/

var PhotoApp = React.createClass({
  getInitialState: function getInitialState() {
    var path = this.getPath();
    return {
      path: path, user: {}, error: "",
      topWalls: { topCount: 10, walls: [] },
      collection: { username: "", walls: [] },
      wall: { wall_id: "", username: "", wallname: "", pins: [] },
      newWallName: "", image_url: "", comment: ""
    };
  },

  componentDidMount: function componentDidMount() {
    this.getUser();
    this.getDataForPath(this.state.path);
    window.addEventListener('hashchange', this.onHashChange);
    $('img').on('error', function () {
      this.src = document.location.origin + '/_img/pins/placeholder_400x400.jpg';
    });
  },

  componentDidUpdate: function componentDidUpdate() {
    $('img').on('error', function () {
      this.src = document.location.origin + '/_img/pins/placeholder_400x400.jpg';
    });
  },

  getPath: function getPath() {
    var path = ["", ""];
    var hash = document.location.hash;
    var hashArr = hash.split("/");
    for (var i = 1, len = hashArr.length; i < len; i++) {
      path[i - 1] = hashArr[i];
    }
    return path;
  },

  setPath: function setPath(path) {
    var hash = "/";
    if (path[0] != "") {
      hash += path[0] + "/";
    }
    if (path[1] != "") {
      hash += path[1] + "/";
    }
    document.location.hash = hash;
    this.setState({ path: path });
    this.getDataForPath(path);
  },

  onHashChange: function onHashChange() {
    var path = this.getPath();
    if (path[0] != this.state.path[0] || path[1] != this.state.path[1]) {
      this.setPath(path);
    }
  },

  getUser: function getUser() {
    $.ajax({
      url: document.location.origin + "/pins/api/user/",
      dataType: 'json',
      success: function (data) {
        if (data.user) {
          this.setState({ user: data.user });
        }
      }.bind(this),
      error: function (xhr, status, err) {
        this.setState({ error: "Unable to send network request. Please reload the page or try again." });
      }.bind(this)
    });
  },

  getTop: function getTop(add) {
    var topCount = this.state.topWalls.topCount + add;
    $.ajax({
      url: document.location.origin + "/pins/api/top/?num=" + topCount,
      dataType: 'json',
      success: function (data) {
        if (data.error) {
          this.setState({ error: data.error });
        } else {
          this.setState({ topWalls: data.topWalls, error: "" });
        }
      }.bind(this),
      error: function (xhr, status, err) {
        this.setState({ error: "Unable to send network request. Please reload the page or try again." });
      }.bind(this)
    });
  },

  getCollection: function getCollection(username) {
    $.ajax({
      url: document.location.origin + "/pins/api/data/" + username,
      dataType: 'json',
      success: function (data) {
        if (data.error) {
          this.setState({ error: data.error });
          if (data.error == "No such user") {
            this.setPath(["", ""]);
          }
        } else {
          this.setState({ collection: data.collection, error: "" });
        }
      }.bind(this),
      error: function (xhr, status, err) {
        this.setState({ error: "Unable to send network request. Please reload the page or try again." });
      }.bind(this)
    });
  },

  getWall: function getWall(username, wall) {
    $.ajax({
      url: document.location.origin + "/pins/api/data/" + username + "/" + wall,
      dataType: 'json',
      success: function (data) {
        if (data.error) {
          this.setState({ error: data.error });
          if (data.error == "No such user") {
            this.setPath(["", ""]);
          }
          if (data.error == "Wall does not exist") {
            this.setPath([username, ""]);
          }
        } else {
          this.setState({ wall: data.wall, error: "" });
        }
      }.bind(this),
      error: function (xhr, status, err) {
        this.setState({ error: "Unable to send network request. Please reload the page or try again." });
      }.bind(this)
    });
  },

  getDataForPath: function getDataForPath(path) {
    if (path[0] === "" && path[1] === "") {
      this.getTop(0);
    } else if (path[0] != "" && path[1] === "") {
      this.getCollection(path[0]);
    } else if (path[0] != "" && path[1] != "") {
      this.getWall(path[0], path[1]);
    }
  },

  updateNewWallName: function updateNewWallName(e) {
    this.setState({ newWallName: e.target.value });
  },

  createWall: function createWall() {
    $.ajax({
      url: document.location.origin + "/pins/api/walls/create/" + this.state.newWallName,
      dataType: 'json',
      success: function (data) {
        if (data.error) {
          this.setState({ error: data.error });
        } else {
          var wall = { wall_id: data.wall_id, wallname: this.state.newWallName, username: this.state.user.username, pins: [] };
          this.setPath([this.state.user.username, this.state.newWallName]);
          this.setState({ wall: wall, newWallName: "" });
        }
      }.bind(this),
      error: function (xhr, status, err) {
        this.setState({ error: "Unable to send network request. Please reload the page or try again." });
      }.bind(this)
    });
  },

  deleteWall: function deleteWall(wallname) {
    var ask = confirm("Are you sure you want to delete this wall?");
    if (ask === true) {
      $.ajax({
        url: document.location.origin + "/pins/api/walls/delete/" + wallname,
        dataType: 'json',
        success: function (data) {
          if (data.error) {
            this.setState({ error: data.error });
          } else {
            this.setPath([this.state.user.username, ""]);
          }
        }.bind(this),
        error: function (xhr, status, err) {
          this.setState({ error: "Unable to send network request. Please reload the page or try again." });
        }.bind(this)
      });
    }
  },

  updateImageURL: function updateImageURL(e) {
    this.setState({ image_url: e.target.value });
  },

  updateComment: function updateComment(e) {
    this.setState({ comment: e.target.value });
  },

  addPin: function addPin() {
    $.ajax({
      url: document.location.origin + "/pins/api/pins/add/",
      dataType: 'json',
      method: 'post',
      data: { username: this.state.wall.username, wall_id: this.state.wall.wall_id, image_url: this.state.image_url, comment: this.state.comment },
      success: function (data) {
        if (data.error) {
          this.setState({ error: data.error });
        } else {
          this.setPath([this.state.path[0], this.state.path[1]]);
          this.setState({ image_url: "", comment: "", error: "" });
        }
      }.bind(this),
      error: function (xhr, status, err) {
        this.setState({ error: "Unable to send network request. Please reload the page or try again." });
      }.bind(this)
    });
  },

  removePin: function removePin(pin_id) {
    $.ajax({
      url: document.location.origin + "/pins/api/pins/remove/",
      dataType: 'json',
      method: 'post',
      data: { username: this.state.wall.username, pin_id: pin_id },
      success: function (data) {
        if (data.error) {
          this.setState({ error: data.error });
        } else {
          this.setPath([this.state.path[0], this.state.path[1]]);
        }
      }.bind(this),
      error: function (xhr, status, err) {
        this.setState({ error: "Unable to send network request. Please reload the page or try again." });
      }.bind(this)
    });
  },

  render: function render() {
    var _this = this;

    var errorSect;
    if (this.state.error != "") {
      errorSect = React.createElement(
        "div",
        { className: "error" },
        "ERROR: ",
        this.state.error
      );
    }

    var tabSect = React.createElement(
      "div",
      { className: "tabLabelSect" },
      React.createElement(
        "div",
        {
          className: this.state.path[0] === "" ? "activeTabLabel" : "inactiveTabLabel",
          onClick: function onClick() {
            return _this.setPath(["", ""]);
          }
        },
        "HOME"
      )
    );

    if (this.state.user.username) {
      tabSect = React.createElement(
        "div",
        { className: "tabLabelSect" },
        React.createElement(
          "div",
          {
            className: this.state.path[0] === "" ? "activeTabLabel" : "inactiveTabLabel",
            onClick: function onClick() {
              return _this.setPath(["", ""]);
            }
          },
          "HOME"
        ),
        React.createElement(
          "div",
          {
            className: this.state.path[0] === this.state.user.username && this.state.path[1] === "" ? "activeTabLabel" : "inactiveTabLabel",
            onClick: function onClick() {
              return _this.setPath([_this.state.user.username, ""]);
            }
          },
          "PROFILE"
        )
      );
    }

    var tab = React.createElement(HomeTab, {
      user: this.state.user,
      path: this.state.path,
      setPath: this.setPath,
      topWalls: this.state.topWalls,
      getTop: this.getTop
    });
    if (this.state.path[0] != "") {
      tab = React.createElement(UserTab, {
        user: this.state.user,
        path: this.state.path,
        setPath: this.setPath,
        collection: this.state.collection,
        newWallName: this.state.newWallName,
        updateNewWallName: this.updateNewWallName,
        createWall: this.createWall
      });
    }
    if (this.state.path[1] != "") {
      tab = React.createElement(WallTab, {
        user: this.state.user,
        path: this.state.path,
        setPath: this.setPath,
        wall: this.state.wall,
        deleteWall: this.deleteWall,
        image_url: this.state.image_url,
        comment: this.state.comment,
        updateImageURL: this.updateImageURL,
        updateComment: this.updateComment,
        addPin: this.addPin,
        removePin: this.removePin
      });
    }

    return React.createElement(
      "div",
      null,
      errorSect,
      tabSect,
      tab
    );
  }
});

/******************************************************************/
/* [1] < HOME TAB /> IN PHOTO APP */
/******************************************************************/

var HomeTab = React.createClass({
  render: function render() {
    var _this2 = this;

    return React.createElement(
      "div",
      { className: "tabContents" },
      React.createElement(
        "div",
        { className: "tabHeader" },
        "Previews of Recently Active Walls"
      ),
      React.createElement(
        "div",
        { className: "appIntro" },
        "Welcome to our Photo Pinning App! You can create your own walls, add links to your favorite photos, and browse other users' walls."
      ),
      React.createElement(WallSet, {
        setPath: this.props.setPath,
        wallSet: this.props.topWalls
      }),
      React.createElement(
        "button",
        { className: "seeMore", onClick: function onClick() {
            return _this2.props.getTop(10);
          } },
        "SEE MORE"
      )
    );
  }
});

/******************************************************************/
/* [1] < USER TAB /> IN PHOTO APP */
/******************************************************************/

var UserTab = React.createClass({
  render: function render() {
    var create;
    if (this.props.user.username && this.props.user.username === this.props.path[0]) {
      create = React.createElement(CreateWall, {
        newWallName: this.props.newWallName,
        updateNewWallName: this.props.updateNewWallName,
        createWall: this.props.createWall
      });
    }
    return React.createElement(
      "div",
      { className: "tabContents" },
      React.createElement(
        "div",
        { className: "tabHeader" },
        "Previews of ",
        this.props.path[0],
        "'s Walls"
      ),
      create,
      React.createElement(WallSet, {
        setPath: this.props.setPath,
        wallSet: this.props.collection
      })
    );
  }
});

/******************************************************************/
/* [1] < WALL TAB /> IN PHOTO APP */
/******************************************************************/

var WallTab = React.createClass({
  render: function render() {
    var _this3 = this;

    var creator = this.props.path[0];
    var wallname = this.props.path[1];
    var deleteWall, addPin;
    if (this.props.user.username && this.props.user.username === creator) {
      deleteWall = React.createElement(
        "button",
        { className: "deleteWall", onClick: function onClick() {
            return _this3.props.deleteWall(wallname);
          } },
        "DELETE WALL"
      );

      addPin = React.createElement(AddPin, {
        image_url: this.props.image_url,
        comment: this.props.comment,
        updateImageURL: this.props.updateImageURL,
        updateComment: this.props.updateComment,
        addPin: this.props.addPin
      });
    }
    return React.createElement(
      "div",
      { className: "tabContents" },
      React.createElement(
        "div",
        { className: "tabHeader" },
        this.props.wall.wallname
      ),
      React.createElement(
        "div",
        { className: "tabSubheader", onClick: function onClick() {
            return _this3.props.setPath([_this3.props.path[0], ""]);
          } },
        "Created by:",
        React.createElement(
          "span",
          null,
          this.props.wall.username
        )
      ),
      deleteWall,
      addPin,
      React.createElement(FullWall, {
        user: this.props.user,
        wall: this.props.wall,
        removePin: this.props.removePin
      })
    );
  }
});

/******************************************************************/
/* [2] < WALL SET /> IN HOME TAB, USER TAB */
/******************************************************************/

var WallSet = React.createClass({
  render: function render() {
    var setPath = this.props.setPath;
    var wallSet = this.props.wallSet;
    var walls = wallSet.walls;
    var wallThumbs = React.createElement(
      "span",
      null,
      "No walls have been created by this user yet."
    );
    if (walls.length > 0) {
      wallThumbs = walls.map(function (wall) {
        return React.createElement(WallPreview, {
          setPath: setPath,
          wall: wall
        });
      });
    }
    return React.createElement(
      "div",
      { className: "wallSet" },
      wallThumbs
    );
  }
});

/******************************************************************/
/* [2] < CREATE WALL /> IN PHOTO APP */
/******************************************************************/

var CreateWall = React.createClass({
  render: function render() {
    return React.createElement(
      "div",
      { className: "createWall" },
      React.createElement(
        "div",
        { className: "createWallHeader" },
        "Create Wall Section"
      ),
      React.createElement(
        "label",
        null,
        "Wall Name"
      ),
      React.createElement("input", {
        value: this.props.newWallName,
        onChange: this.props.updateNewWallName
      }),
      React.createElement(
        "button",
        { onClick: this.props.createWall },
        "CREATE"
      )
    );
  }
});

/******************************************************************/
/* [2] < ADD PIN /> IN WALL TAB */
/******************************************************************/

var AddPin = React.createClass({
  render: function render() {
    return React.createElement(
      "div",
      { className: "addPin" },
      React.createElement(
        "div",
        { className: "addPinHeader" },
        "Add New Pin"
      ),
      React.createElement(
        "div",
        { className: "addPinInputSect" },
        React.createElement(
          "label",
          null,
          "Image Link"
        ),
        React.createElement("input", { value: this.props.image_url, onChange: this.props.updateImageURL }),
        React.createElement(
          "label",
          null,
          "Description"
        ),
        React.createElement("input", { value: this.props.comment, onChange: this.props.updateComment }),
        React.createElement(
          "button",
          { onClick: this.props.addPin },
          "ADD"
        )
      )
    );
  }
});

/******************************************************************/
/* [2] < FULL WALL /> IN WALL TAB */
/******************************************************************/

var FullWall = React.createClass({
  render: function render() {
    var user = this.props.user;
    var pins = this.props.wall.pins;
    var creator = this.props.wall.username;
    var removePin = this.props.removePin;
    var pinThumbs = React.createElement(
      "span",
      null,
      "No pins have been added yet."
    );
    if (pins.length > 0) {
      pinThumbs = pins.map(function (pin) {
        return React.createElement(ViewPin, {
          user: user,
          pin: pin,
          creator: creator,
          behavior: function behavior() {
            return removePin(pin.pin_id);
          }
        });
      });
    }
    return React.createElement(
      "div",
      { className: "fullWall" },
      pinThumbs
    );
  }
});

/******************************************************************/
/* [3] < WALL PREVIEW /> IN TOP WALLS */
/******************************************************************/

var WallPreview = React.createClass({
  render: function render() {
    var _this4 = this;

    var pins = this.props.wall.pins;
    var creator = this.props.wall.username;
    var pinThumbs = [];
    var pinNum = Math.min(pins.length, 6);
    if (pinNum > 0) {
      for (var n = 0; n < pinNum; n++) {
        pinThumbs.push(React.createElement(ViewPin, {
          pin: pins[n],
          creator: creator
        }));
      }
    } else {
      pinThumbs = React.createElement(
        "span",
        null,
        "No pins have been added to this wall yet."
      );
    }
    return React.createElement(
      "div",
      { className: "wallPreview" },
      React.createElement(
        "div",
        { className: "wallPreviewHeader",
          onClick: function onClick() {
            return _this4.props.setPath([_this4.props.wall.username, _this4.props.wall.wallname]);
          }
        },
        this.props.wall.wallname
      ),
      React.createElement(
        "div",
        { className: "wallPreviewSubheader",
          onClick: function onClick() {
            return _this4.props.setPath([_this4.props.wall.username, ""]);
          }
        },
        this.props.wall.username
      ),
      pinThumbs
    );
  }
});

/******************************************************************/
/* [3 / 4] < VIEW PIN /> IN FULL WALL, WALL PREVIEW */
/******************************************************************/

var ViewPin = React.createClass({
  render: function render() {
    var button;
    if (this.props.user && this.props.user.username === this.props.creator && this.props.behavior) {
      button = React.createElement(
        "button",
        { onClick: this.props.behavior },
        "REMOVE"
      );
    }
    return React.createElement(
      "div",
      { className: "pin" },
      button,
      React.createElement(
        "div",
        { className: "imageDiv" },
        React.createElement("img", { src: this.props.pin.image_url, alt: this.props.pin.comment })
      ),
      React.createElement(
        "div",
        { className: "comment" },
        this.props.pin.comment
      ),
      React.createElement(
        "div",
        { className: "creator" },
        this.props.creator
      )
    );
  }
});

/******************************************************************/
/* RENDER */
/******************************************************************/

ReactDOM.render(React.createElement(PhotoApp, null), document.getElementById('contentSect'));