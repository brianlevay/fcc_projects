"use strict";

//// This is the root React class that builds the leaderboards ////

var LeaderBoard = React.createClass({
  displayName: "LeaderBoard",

  getInitialState: function getInitialState() {
    return { recentTop: [], totalTop: [], showRecent: false };
  },
  loadRecentTop: function loadRecentTop() {
    $.ajax({
      url: "https://fcctop100.herokuapp.com/api/fccusers/top/recent",
      dataType: 'json',
      success: function (data) {
        this.setState({ recentTop: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  loadTotalTop: function loadTotalTop() {
    $.ajax({
      url: "https://fcctop100.herokuapp.com/api/fccusers/top/alltime",
      dataType: 'json',
      success: function (data) {
        this.setState({ totalTop: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  sortByRecent: function sortByRecent() {
    this.setState({ showRecent: true });
  },
  sortByTotal: function sortByTotal() {
    this.setState({ showRecent: false });
  },
  componentDidMount: function componentDidMount() {
    this.loadRecentTop();
    this.loadTotalTop();
  },
  render: function render() {
    var camperListXML = [];
    var recentClasses = "recent";
    var totalClasses = "total";
    if (this.state.recentTop.length > 0 && this.state.showRecent === true) {
      camperListXML = React.createElement(CamperList, { campers: this.state.recentTop });
      recentClasses = "recent sortedBy";
      totalClasses = "total notSortedBy";
    } else if (this.state.totalTop.length > 0 && this.state.showRecent === false) {
      camperListXML = React.createElement(CamperList, { campers: this.state.totalTop });
      recentClasses = "recent notSortedBy";
      totalClasses = "total sortedBy";
    }
    return React.createElement(
      "div",
      null,
      React.createElement(
        "div",
        { className: "rowTitle" },
        React.createElement(
          "div",
          { className: "rank" },
          "#"
        ),
        React.createElement(
          "div",
          { className: "camper" },
          "Camper"
        ),
        React.createElement(
          "div",
          { className: recentClasses, onClick: this.sortByRecent },
          "Points in Last 30 Days"
        ),
        React.createElement(
          "div",
          { className: totalClasses, onClick: this.sortByTotal },
          "All-Time Points"
        )
      ),
      camperListXML
    );
  }
});

//// This is the React class that builds the lists out of Camper classes ////

var CamperList = React.createClass({
  displayName: "CamperList",

  render: function render() {
    var camperXML = [];
    var num = this.props.campers.length;
    for (var i = 0; i < num; i++) {
      camperXML.push(React.createElement(Camper, { rank: i + 1, entry: this.props.campers[i] }));
    }
    return React.createElement(
      "div",
      null,
      camperXML
    );
  }
});

//// This creates the individual camper elements ////

var Camper = React.createClass({
  displayName: "Camper",

  render: function render() {
    var link = "https://www.freecodecamp.com/" + this.props.entry.username;
    return React.createElement(
      "div",
      { className: "rowEntry" },
      React.createElement(
        "div",
        { className: "rank" },
        this.props.rank
      ),
      React.createElement(
        "div",
        { className: "camper" },
        React.createElement(
          "div",
          { className: "pic" },
          React.createElement("img", { src: this.props.entry.img })
        ),
        React.createElement(
          "div",
          { className: "name" },
          React.createElement(
            "a",
            { href: link, target: "_blank" },
            this.props.entry.username
          )
        )
      ),
      React.createElement(
        "div",
        { className: "recent" },
        this.props.entry.recent
      ),
      React.createElement(
        "div",
        { className: "total" },
        this.props.entry.alltime
      )
    );
  }
});

// This renders the virtual DOM contents within the container section //

ReactDOM.render(React.createElement(LeaderBoard, null), document.getElementById('containerSect'));

//// End of script ////