"use strict";

/******************************************************************/
/* REACT CLASS STRUCTURE */
/******************************************************************/

//  BookApp       
//  ---  HomeTab  
//  |    ---  TopCopies
//	|					--- ViewBook
//  ---  ProfileTab
//  |    ---  ProfileSect
//  |    ---  AddBooks
//  |         --- ViewBook
//	|    ---  MyCopies
//  |         --- ViewBook
//  ---  TradesTab
//       ---  MyRequests
//            --- ViewBook
//       ---  RequestsForMine
//            --- ViewBook
//       ---  TradeOptions
//            --- ViewBook

/******************************************************************/
/* [0] < BOOK APP /> - ROOT REACT CLASS */
/******************************************************************/

var BookApp = React.createClass({
  getInitialState: function getInitialState() {
    return {
      visible: "home", user: {}, numFetched: 0, topCopies: [],
      suggestedBooks: [], myCopies: [], myRequests: [], requestsForMine: [],
      tradeOptions: [], myTrade: {}, error: ""
    };
  },

  componentDidMount: function componentDidMount() {
    this.getTopBooks(20);
    this.getUserData();
  },

  getTopBooks: function getTopBooks(add) {
    var numToFetch = this.state.numFetched + add;
    $.ajax({
      url: document.location.origin + "/books/top/?offset=0&num=" + numToFetch,
      dataType: 'json',
      success: function (data) {
        if (data.error) {
          this.setState({ error: data.error });
        } else {
          this.setState({ numFetched: numToFetch, topCopies: data.topCopies, error: "" });
        }
      }.bind(this),
      error: function (xhr, status, err) {
        this.setState({ error: "Unable to send network request. Please reload the page or try again." });
      }.bind(this)
    });
  },

  getUserData: function getUserData() {
    $.ajax({
      url: document.location.origin + "/books/user/data/",
      dataType: 'json',
      success: function (data) {
        if (data.error) {
          this.setState({ error: data.error });
        } else {
          var requestsForMine = [];
          for (var i = 0, len = data.myCopies.length; i < len; i++) {
            if (data.myCopies[i].requested_by != "none") {
              requestsForMine.push(data.myCopies[i]);
            }
          }
          this.setState({
            user: data.user, myCopies: data.myCopies, myRequests: data.myRequests,
            requestsForMine: requestsForMine, error: ""
          });
        }
      }.bind(this),
      error: function (xhr, status, err) {
        this.setState({ error: "Unable to send network request. Please reload the page or try again." });
      }.bind(this)
    });
  },

  toggleTabVis: function toggleTabVis(tab) {
    this.setState({ visible: tab });
  },

  updateFullName: function updateFullName(e) {
    var user = this.state.user;
    user.fullname = e.target.value;
    this.setState({ user: user });
  },

  updateCity: function updateCity(e) {
    var user = this.state.user;
    user.city = e.target.value;
    this.setState({ user: user });
  },

  updateState: function updateState(e) {
    var user = this.state.user;
    user.state = e.target.value;
    this.setState({ user: user });
  },

  updateProfile: function updateProfile() {
    $.ajax({
      url: document.location.origin + "/books/user/update",
      dataType: 'json',
      method: 'POST',
      data: { user: this.state.user },
      success: function (data) {
        if (data.error) {
          this.setState({ error: data.error });
        } else {
          this.getUserData();
          this.getTopBooks(0);
          this.setState({ error: "" });
        }
      }.bind(this),
      error: function (xhr, status, err) {
        this.setState({ error: "Unable to send network request. Please reload the page or try again." });
      }.bind(this)
    });
  },

  updateSearchTextVal: function updateSearchTextVal(e) {
    this.setState({ searchTextVal: e.target.value });
  },

  updateSearchNumVal: function updateSearchNumVal(e) {
    this.setState({ searchNumVal: e.target.value });
  },

  searchByText: function searchByText() {
    $.ajax({
      url: document.location.origin + "/books/user/new/?text=" + encodeURIComponent(this.state.searchTextVal),
      dataType: 'json',
      success: function (data) {
        if (data.error) {
          this.setState({ error: data.error });
        } else {
          this.setState({ suggestedBooks: data.suggestedBooks, error: "" });
        }
      }.bind(this),
      error: function (xhr, status, err) {
        this.setState({ error: "Unable to send network request. Please reload the page or try again." });
      }.bind(this)
    });
  },

  searchByNum: function searchByNum() {
    $.ajax({
      url: document.location.origin + "/books/user/new/?isbn13=" + encodeURIComponent(this.state.searchNumVal),
      dataType: 'json',
      success: function (data) {
        if (data.error) {
          this.setState({ error: data.error });
        } else {
          this.setState({ suggestedBooks: data.suggestedBooks, error: "" });
        }
      }.bind(this),
      error: function (xhr, status, err) {
        this.setState({ error: "Unable to send network request. Please reload the page or try again." });
      }.bind(this)
    });
  },

  removeItemFromArray: function removeItemFromArray(array, arr_id, ext_id) {
    var index = -1;
    for (var i = 0, len = array.length; i < len; i++) {
      if (array[i][arr_id] == ext_id) {
        index = i;
      }
    }
    if (index != -1) {
      array.splice(index, 1);
    }
    return array;
  },

  addBook: function addBook(book) {
    $.ajax({
      url: document.location.origin + "/books/user/add/",
      dataType: 'json',
      method: 'POST',
      data: { book: book },
      success: function (data) {
        if (data.error) {
          this.setState({ error: data.error });
        } else {
          var myCopies = this.state.myCopies;
          var suggestedBooks = this.state.suggestedBooks;
          var topCopies = this.state.topCopies;
          myCopies.push(data.copy);
          topCopies.push(data.copy);
          suggestedBooks = this.removeItemFromArray(suggestedBooks, "book_id", data.copy.book_id);
          this.setState({
            myCopies: myCopies, topCopies: topCopies,
            suggestedBooks: suggestedBooks, error: ""
          });
        }
      }.bind(this),
      error: function (xhr, status, err) {
        this.setState({ error: "Unable to send network request. Please reload the page or try again." });
      }.bind(this)
    });
  },

  removeCopy: function removeCopy(copy_id) {
    $.ajax({
      url: document.location.origin + "/books/user/remove/",
      dataType: 'json',
      method: 'POST',
      data: { copy_id: copy_id },
      success: function (data) {
        if (data.error) {
          this.setState({ error: data.error });
        } else {
          var myCopies = this.state.myCopies;
          var requestsForMine = this.state.requestsForMine;
          var topCopies = this.state.topCopies;
          myCopies = this.removeItemFromArray(myCopies, "copy_id", copy_id);
          requestsForMine = this.removeItemFromArray(requestsForMine, "copy_id", copy_id);
          topCopies = this.removeItemFromArray(topCopies, "copy_id", copy_id);
          this.setState({
            myCopies: myCopies, requestsForMine: requestsForMine,
            topCopies: topCopies, error: ""
          });
        }
      }.bind(this),
      error: function (xhr, status, err) {
        this.setState({ error: "Unable to send network request. Please reload the page or try again." });
      }.bind(this)
    });
  },

  clearSuggested: function clearSuggested() {
    this.setState({ suggestedBooks: [] });
  },

  toggleRequest: function toggleRequest(copy, username, cancel) {
    $.ajax({
      url: document.location.origin + "/books/request/",
      dataType: 'json',
      method: 'POST',
      data: { copy_id: copy.copy_id, username: username, cancel: cancel },
      success: function (data) {
        if (data.error) {
          this.setState({ error: data.error });
        } else {
          var myRequests = this.state.myRequests;
          var requestsForMine = this.state.requestsForMine;
          var topCopies = this.state.topCopies;
          var tradeOptions = this.state.tradeOptions;
          if (cancel === "false") {
            copy.requested_by = username;
            myRequests.push(copy);
            topCopies = this.removeItemFromArray(topCopies, "copy_id", copy.copy_id);
          } else {
            copy.requested_by = "none";
            topCopies.push(copy);
            myRequests = this.removeItemFromArray(myRequests, "copy_id", copy.copy_id);
            requestsForMine = this.removeItemFromArray(requestsForMine, "copy_id", copy.copy_id);
            tradeOptions = [];
          }
          this.setState({
            myRequests: myRequests, requestsForMine: requestsForMine,
            topCopies: topCopies, tradeOptions: tradeOptions, error: ""
          });
        }
      }.bind(this),
      error: function (xhr, status, err) {
        this.setState({ error: "Unable to send network request. Please reload the page or try again." });
      }.bind(this)
    });
  },

  viewTradeOpts: function viewTradeOpts(myTrade, username) {
    $.ajax({
      url: document.location.origin + "/books/options/?username=" + username,
      dataType: 'json',
      success: function (data) {
        if (data.error) {
          this.setState({ error: data.error });
        } else {
          this.setState({ tradeOptions: data.tradeOptions, myTrade: myTrade, error: "" });
        }
      }.bind(this),
      error: function (xhr, status, err) {
        this.setState({ error: "Unable to send network request. Please reload the page or try again." });
      }.bind(this)
    });
  },

  tradeCopies: function tradeCopies(otherTrade) {
    $.ajax({
      url: document.location.origin + "/books/trade/",
      dataType: 'json',
      method: 'POST',
      data: { myTrade: this.state.myTrade, otherTrade: otherTrade },
      success: function (data) {
        if (data.error) {
          this.setState({ error: data.error });
        } else {
          this.getUserData();
          this.getTopBooks(0);
          this.setState({ tradeOptions: [] });
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
        { className: "activeTabLabel", onClick: function onClick() {
            return _this.toggleTabVis("home");
          } },
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
            className: this.state.visible === "home" ? "activeTabLabel" : "inactiveTabLabel",
            onClick: function onClick() {
              return _this.toggleTabVis("home");
            }
          },
          "HOME"
        ),
        React.createElement(
          "div",
          {
            className: this.state.visible === "profile" ? "activeTabLabel" : "inactiveTabLabel",
            onClick: function onClick() {
              return _this.toggleTabVis("profile");
            }
          },
          "PROFILE"
        ),
        React.createElement(
          "div",
          {
            className: this.state.visible === "trades" ? "activeTabLabel" : "inactiveTabLabel",
            onClick: function onClick() {
              return _this.toggleTabVis("trades");
            }
          },
          "TRADES"
        )
      );
    }

    var tab;
    if (this.state.visible === "home") {
      tab = React.createElement(HomeTab, {
        user: this.state.user,
        topCopies: this.state.topCopies,
        numFetched: this.state.numFetched,
        getTopBooks: this.getTopBooks,
        toggleRequest: this.toggleRequest
      });
    } else if (this.state.visible === "profile") {
      tab = React.createElement(ProfileTab, {
        user: this.state.user,
        updateFullName: this.updateFullName,
        updateCity: this.updateCity,
        updateState: this.updateState,
        updateProfile: this.updateProfile,
        searchTextVal: this.state.searchTextVal,
        searchNumVal: this.state.searchNumVal,
        updateSearchTextVal: this.updateSearchTextVal,
        updateSearchNumVal: this.updateSearchNumVal,
        searchByText: this.searchByText,
        searchByNum: this.searchByNum,
        suggestedBooks: this.state.suggestedBooks,
        addBook: this.addBook,
        clearSuggested: this.clearSuggested,
        myCopies: this.state.myCopies,
        removeCopy: this.removeCopy
      });
    } else {
      tab = React.createElement(TradesTab, {
        user: this.state.user,
        myRequests: this.state.myRequests,
        requestsForMine: this.state.requestsForMine,
        toggleRequest: this.toggleRequest,
        tradeOptions: this.state.tradeOptions,
        viewTradeOpts: this.viewTradeOpts,
        tradeCopies: this.tradeCopies,
        myTrade: this.state.myTrade
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
/* [1] < HOME TAB /> IN BOOK APP */
/******************************************************************/

var HomeTab = React.createClass({
  render: function render() {
    return React.createElement(
      "div",
      { className: "tabContents" },
      React.createElement(
        "div",
        { className: "tabHeader" },
        "Search for Books"
      ),
      React.createElement(
        "div",
        { className: "appIntro" },
        "Welcome to our Book Trading App! As an authorized user, you can search for your own books using the Google Books API and add them to your inventory. You can find books owned by other people, and you can request a trade. If the other user agrees to the trade, they can make an exchange for one of your books, or they can give you the book for free! In this app, all trades are virtual. In a real production app, there would be methods to deal with addresses, confirmation of shipping, etc., but we take all of the challenges out of managing your trades. Enjoy!"
      ),
      React.createElement(TopCopies, {
        user: this.props.user,
        topCopies: this.props.topCopies,
        numFetched: this.props.numFetched,
        getTopBooks: this.props.getTopBooks,
        toggleRequest: this.props.toggleRequest
      })
    );
  }
});

/******************************************************************/
/* [1] < PROFILE TAB /> IN BOOK APP */
/******************************************************************/

var ProfileTab = React.createClass({
  render: function render() {
    return React.createElement(
      "div",
      { className: "tabContents" },
      React.createElement(
        "div",
        { className: "tabHeader" },
        "Your Profile"
      ),
      React.createElement(ProfileSect, {
        user: this.props.user,
        updateFullName: this.props.updateFullName,
        updateCity: this.props.updateCity,
        updateState: this.props.updateState,
        updateProfile: this.props.updateProfile
      }),
      React.createElement(AddBooks, {
        searchTextVal: this.props.searchTextVal,
        searchNumVal: this.props.searchNumVal,
        updateSearchTextVal: this.props.updateSearchTextVal,
        updateSearchNumVal: this.props.updateSearchNumVal,
        searchByText: this.props.searchByText,
        searchByNum: this.props.searchByNum,
        suggestedBooks: this.props.suggestedBooks,
        addBook: this.props.addBook,
        clearSuggested: this.props.clearSuggested
      }),
      React.createElement(MyCopies, {
        myCopies: this.props.myCopies,
        removeCopy: this.props.removeCopy
      })
    );
  }
});

/******************************************************************/
/* [1] < TRADES TAB /> IN BOOK APP */
/******************************************************************/

var TradesTab = React.createClass({
  render: function render() {
    return React.createElement(
      "div",
      { className: "tabContents" },
      React.createElement(
        "div",
        { className: "tabHeader" },
        "Manage Your Trades"
      ),
      React.createElement(MyRequests, {
        user: this.props.user,
        myRequests: this.props.myRequests,
        toggleRequest: this.props.toggleRequest
      }),
      React.createElement(RequestsForMine, {
        user: this.props.user,
        requestsForMine: this.props.requestsForMine,
        toggleRequest: this.props.toggleRequest,
        viewTradeOpts: this.props.viewTradeOpts,
        myTrade: this.props.myTrade
      }),
      React.createElement(TradeOptions, {
        tradeOptions: this.props.tradeOptions,
        tradeCopies: this.props.tradeCopies
      })
    );
  }
});

/******************************************************************/
/* [2] < TOP COPIES /> IN HOME TAB */
/******************************************************************/

var TopCopies = React.createClass({
  render: function render() {
    var user = this.props.user;
    var topCopies = this.props.topCopies;
    var getTopBooks = this.props.getTopBooks;
    var toggleRequest = this.props.toggleRequest;
    var topThumbs = React.createElement(
      "span",
      null,
      "No books are available for trade yet."
    );
    if (topCopies.length > 0) {
      if (user.username) {
        topThumbs = topCopies.map(function (copy) {
          var labelA = "REQUEST";
          if (copy.username === user.username) {
            labelA = "NONE";
          }
          return React.createElement(ViewBook, {
            "class": "book",
            book: copy,
            behaviorA: function behaviorA() {
              return toggleRequest(copy, user.username, "false");
            },
            labelA: labelA,
            behaviorB: "return false",
            labelB: "NONE"
          });
        });
      } else {
        topThumbs = topCopies.map(function (copy) {
          return React.createElement(ViewBook, {
            "class": "book",
            book: copy,
            behaviorA: "return false",
            labelA: "NONE",
            behaviorB: "return false",
            labelB: "NONE"
          });
        });
      }
      topThumbs.push(React.createElement(
        "button",
        { className: "seeMore", onClick: function onClick() {
            return getTopBooks(20);
          } },
        "SEE MORE"
      ));
    }
    return React.createElement(
      "div",
      { className: "bookSect" },
      React.createElement(
        "div",
        { className: "bookSectHeader" },
        "Books Available For Trade"
      ),
      React.createElement(
        "div",
        { className: "thumbSect" },
        topThumbs
      )
    );
  }
});

/******************************************************************/
/* [2] < PROFILE SECT /> IN PROFILE TAB */
/******************************************************************/

var ProfileSect = React.createClass({
  render: function render() {
    return React.createElement(
      "div",
      { className: "profile" },
      React.createElement(
        "div",
        { className: "greeting" },
        "Hello ",
        this.props.user.username,
        "!"
      ),
      React.createElement(
        "label",
        null,
        "Full Name"
      ),
      React.createElement("input", {
        value: this.props.user.fullname,
        onChange: this.props.updateFullName
      }),
      React.createElement(
        "label",
        null,
        "City"
      ),
      React.createElement("input", {
        value: this.props.user.city,
        onChange: this.props.updateCity
      }),
      React.createElement(
        "label",
        null,
        "State"
      ),
      React.createElement("input", {
        value: this.props.user.state,
        onChange: this.props.updateState
      }),
      React.createElement(
        "button",
        { onClick: this.props.updateProfile },
        "UPDATE"
      )
    );
  }
});

/******************************************************************/
/* [2] < ADD BOOKS /> IN PROFILE TAB */
/******************************************************************/

var AddBooks = React.createClass({
  render: function render() {
    var addBook = this.props.addBook;
    var suggestedBooks = this.props.suggestedBooks;
    var suggestedThumbs = React.createElement(
      "span",
      null,
      "Search to find copies of books you own"
    );
    if (suggestedBooks.length > 0) {
      suggestedThumbs = suggestedBooks.map(function (book) {
        return React.createElement(ViewBook, {
          "class": "book",
          book: book,
          behaviorA: function behaviorA() {
            return addBook(book);
          },
          labelA: "ADD",
          behaviorB: "return false",
          labelB: "NONE"
        });
      });
      suggestedThumbs.unshift(React.createElement(
        "button",
        { className: "clearSuggested", onClick: this.props.clearSuggested },
        "CLEAR"
      ));
    }
    return React.createElement(
      "div",
      { className: "addBooks" },
      React.createElement(
        "div",
        { className: "addBooksHeader" },
        "Add Books to Your Collection"
      ),
      React.createElement(
        "div",
        { className: "searchSect" },
        React.createElement(
          "div",
          { className: "searchSubheader" },
          "Search By Title or Author"
        ),
        React.createElement("input", {
          className: "searchInput",
          value: this.props.searchTextVal,
          onChange: this.props.updateSearchTextVal
        }),
        React.createElement(
          "button",
          {
            className: "searchBtn",
            onClick: this.props.searchByText
          },
          "Search"
        )
      ),
      React.createElement(
        "div",
        { className: "searchSect" },
        React.createElement(
          "div",
          { className: "searchSubheader" },
          "Search By ISBN13"
        ),
        React.createElement("input", {
          className: "searchInput",
          value: this.props.searchNumVal,
          onChange: this.props.updateSearchNumVal
        }),
        React.createElement(
          "button",
          {
            className: "searchBtn",
            onClick: this.props.searchByNum
          },
          "Search"
        )
      ),
      React.createElement(
        "div",
        { className: "bookSect" },
        React.createElement(
          "div",
          { className: "bookSectHeader" },
          "Search Results"
        ),
        React.createElement(
          "div",
          { className: "thumbSect" },
          suggestedThumbs
        )
      )
    );
  }
});

/******************************************************************/
/* [2] < MY COPIES /> IN PROFILE TAB */
/******************************************************************/

var MyCopies = React.createClass({
  render: function render() {
    var removeCopy = this.props.removeCopy;
    var myCopies = this.props.myCopies;
    var myThumbs = React.createElement(
      "span",
      null,
      "You haven't added any books yet."
    );
    if (myCopies.length > 0) {
      myThumbs = myCopies.map(function (copy) {
        return React.createElement(ViewBook, {
          "class": "book",
          book: copy,
          behaviorA: function behaviorA() {
            return removeCopy(copy.copy_id);
          },
          labelA: "REMOVE",
          behaviorB: "return false",
          labelB: "NONE"
        });
      });
    }
    return React.createElement(
      "div",
      { className: "bookSect" },
      React.createElement(
        "div",
        { className: "bookSectHeader" },
        "Your Book Collection"
      ),
      React.createElement(
        "div",
        { className: "thumbSect" },
        myThumbs
      )
    );
  }
});

/******************************************************************/
/* [2] < MY REQUESTS /> IN TRADES TAB */
/******************************************************************/

var MyRequests = React.createClass({
  render: function render() {
    var user = this.props.user;
    var myRequests = this.props.myRequests;
    var toggleRequest = this.props.toggleRequest;
    var reqThumbs = React.createElement(
      "span",
      null,
      "You don't have any outstanding requests."
    );
    if (myRequests.length > 0) {
      reqThumbs = myRequests.map(function (copy) {
        return React.createElement(ViewBook, {
          "class": "book",
          book: copy,
          behaviorA: function behaviorA() {
            return toggleRequest(copy, user.username, "true");
          },
          labelA: "CANCEL",
          behaviorB: "return false",
          labelB: "NONE"
        });
      });
    }
    return React.createElement(
      "div",
      { className: "bookSect" },
      React.createElement(
        "div",
        { className: "bookSectHeader" },
        "Your Requests, Awaiting Approval"
      ),
      React.createElement(
        "div",
        { className: "thumbSect" },
        reqThumbs
      )
    );
  }
});

/******************************************************************/
/* [2] < REQUESTS FOR MINE /> IN TRADES TAB */
/******************************************************************/

var RequestsForMine = React.createClass({
  render: function render() {
    var user = this.props.user;
    var requestsForMine = this.props.requestsForMine;
    var viewTradeOpts = this.props.viewTradeOpts;
    var myTrade = this.props.myTrade;
    var toggleRequest = this.props.toggleRequest;
    var reqThumbs = React.createElement(
      "span",
      null,
      "No one has requested one of your books yet."
    );
    if (requestsForMine.length > 0) {
      reqThumbs = requestsForMine.map(function (copy) {
        return React.createElement(ViewBook, {
          "class": myTrade.copy_id === copy.copy_id ? "book highlight" : "book",
          book: copy,
          behaviorA: function behaviorA() {
            return viewTradeOpts(copy, copy.requested_by);
          },
          labelA: "SEE OPTIONS",
          behaviorB: function behaviorB() {
            return toggleRequest(copy, user.username, "true");
          },
          labelB: "DECLINE"
        });
      });
    }
    return React.createElement(
      "div",
      { className: "bookSect" },
      React.createElement(
        "div",
        { className: "bookSectHeader" },
        "Copies of Your Books that Others Have Requested"
      ),
      React.createElement(
        "div",
        { className: "thumbSect" },
        reqThumbs
      )
    );
  }
});

/******************************************************************/
/* [2] < TRADE OPTIONS /> IN TRADES TAB */
/******************************************************************/

var TradeOptions = React.createClass({
  render: function render() {
    var tradeOptions = this.props.tradeOptions;
    var tradeCopies = this.props.tradeCopies;
    var optThumbs = React.createElement(
      "span",
      null,
      "Click on one of your incoming trade requests to see your options."
    );
    if (tradeOptions.length > 0) {
      optThumbs = tradeOptions.map(function (copy) {
        return React.createElement(ViewBook, {
          "class": "book",
          book: copy,
          behaviorA: function behaviorA() {
            return tradeCopies(copy);
          },
          labelA: "TRADE FOR THIS",
          behaviorB: "return false",
          labelB: "NONE"
        });
      });
      optThumbs.unshift(React.createElement(
        "button",
        { className: "tradeForNone", onClick: function onClick() {
            return tradeCopies(null);
          } },
        "TRADE FOR FREE"
      ));
    }
    return React.createElement(
      "div",
      { className: "bookSect" },
      React.createElement(
        "div",
        { className: "bookSectHeader" },
        "Books You Can Get If You Agree"
      ),
      React.createElement(
        "div",
        { className: "thumbSect" },
        optThumbs
      )
    );
  }
});

/******************************************************************/
/* [3] < VIEW BOOK /> IN MULTIPLE COMPONENTS */
/******************************************************************/

var ViewBook = React.createClass({
  render: function render() {
    var buttonA, buttonB;
    if (this.props.labelA != "NONE") {
      buttonA = React.createElement(
        "div",
        { className: "behaviorA" },
        React.createElement(
          "button",
          { onClick: this.props.behaviorA },
          this.props.labelA
        )
      );
    }
    if (this.props.labelB != "NONE") {
      buttonB = React.createElement(
        "div",
        { className: "behaviorB" },
        React.createElement(
          "button",
          { onClick: this.props.behaviorB },
          this.props.labelB
        )
      );
    }
    var bookOwner, bookCity, bookState;
    if (this.props.book.username) {
      bookOwner = this.props.book.username;
      if (this.props.book.fullname != "") {
        bookOwner = this.props.book.fullname;
      }
      if (this.props.book.city != "") {
        bookCity = this.props.book.city;
      }
      if (this.props.book.state != "") {
        bookState = this.props.book.state;
      }
    }
    return React.createElement(
      "div",
      { className: this.props.class },
      buttonB,
      React.createElement(
        "div",
        { className: "thumbnail" },
        React.createElement(
          "a",
          { href: this.props.book.info_url, target: "_blank" },
          React.createElement("img", { alt: this.props.book.title, src: this.props.book.image_url })
        )
      ),
      React.createElement(
        "div",
        { className: "bookDetails" },
        React.createElement(
          "div",
          { className: "bookTitle" },
          this.props.book.title
        ),
        React.createElement(
          "div",
          { className: "bookAuthors" },
          this.props.book.authors
        ),
        React.createElement(
          "div",
          { className: "bookOwner" },
          bookOwner
        ),
        React.createElement(
          "div",
          { className: "bookLocation" },
          bookCity,
          " ",
          bookState
        )
      ),
      buttonA
    );
  }
});

/******************************************************************/
/* RENDER */
/******************************************************************/

ReactDOM.render(React.createElement(BookApp, null), document.getElementById('contentSect'));