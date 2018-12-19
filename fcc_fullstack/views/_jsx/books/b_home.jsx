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
  getInitialState: function() {
    return { 
    	visible: "home", user: {}, numFetched: 0, topCopies: [], 
    	suggestedBooks: [], myCopies: [], myRequests: [], requestsForMine: [], 
    	tradeOptions: [], myTrade: {}, error: "" 
    };
  },
  
  componentDidMount: function(){
  	this.getTopBooks(20);
    this.getUserData();
  },
  
  getTopBooks: function(add) {
  	var numToFetch = this.state.numFetched + add;
  	$.ajax({
      url: document.location.origin + "/books/top/?offset=0&num=" + numToFetch,
      dataType: 'json',
      success: function(data) {
      	if (data.error) {
      		this.setState({error: data.error});
      	} else {
      		this.setState({numFetched: numToFetch, topCopies: data.topCopies, error: ""});
      	}
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({error: "Unable to send network request. Please reload the page or try again."});
      }.bind(this)
    });
  },
  
  getUserData: function() {
  	$.ajax({
      url: document.location.origin + "/books/user/data/",
      dataType: 'json',
      success: function(data) {
      	if (data.error) {
      		this.setState({error: data.error});
      	} else {
	      	var requestsForMine = [];
	      	for (var i=0, len=data.myCopies.length; i<len; i++) {
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
      error: function(xhr, status, err) {
        this.setState({error: "Unable to send network request. Please reload the page or try again."});
      }.bind(this)
    });
  },
  
  toggleTabVis: function(tab) {
    this.setState({visible: tab});
  },
  
  updateFullName: function(e) {
  	var user = this.state.user;
  	user.fullname = e.target.value;
    this.setState({user: user});
  },
  
  updateCity: function(e) {
    var user = this.state.user;
  	user.city = e.target.value;
    this.setState({user: user});
  },
  
  updateState: function(e) {
    var user = this.state.user;
  	user.state = e.target.value;
    this.setState({user: user});
  },
  
  updateProfile: function() {
  	$.ajax({
      url: document.location.origin + "/books/user/update",
      dataType: 'json',
      method: 'POST',
      data: {user: this.state.user},
      success: function(data) {
      	if (data.error) {
      		this.setState({error: data.error});
      	} else {
      		this.getUserData();
      		this.getTopBooks(0);
      		this.setState({error: ""});
      	}
      }.bind(this),
      error: function(xhr, status, err) {
      	this.setState({error: "Unable to send network request. Please reload the page or try again."});
      }.bind(this)
    });
  },
  
  updateSearchTextVal: function(e) {
    this.setState({searchTextVal: e.target.value});
  },
  
  updateSearchNumVal: function(e) {
  	this.setState({searchNumVal: e.target.value});
  },
  
  searchByText: function() {
  	$.ajax({
      url: document.location.origin + "/books/user/new/?text=" + encodeURIComponent(this.state.searchTextVal),
      dataType: 'json',
      success: function(data) {
      	if (data.error) {
      		this.setState({error: data.error});
      	} else {
      		this.setState({suggestedBooks: data.suggestedBooks, error: ""});
      	}
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({error: "Unable to send network request. Please reload the page or try again."});
      }.bind(this)
    });
  },
  
  searchByNum: function() {
		$.ajax({
      url: document.location.origin + "/books/user/new/?isbn13=" + encodeURIComponent(this.state.searchNumVal),
      dataType: 'json',
      success: function(data) {
        if (data.error) {
      		this.setState({error: data.error});
      	} else {
      		this.setState({suggestedBooks: data.suggestedBooks, error: ""});
      	}
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({error: "Unable to send network request. Please reload the page or try again."});
      }.bind(this)
    });
  },
  
  removeItemFromArray: function(array,arr_id,ext_id) {
  	var index = -1;
    for (var i=0, len=array.length; i<len; i++) {
      if (array[i][arr_id] == ext_id) {index = i;}
    }
    if (index != -1) {
      array.splice(index,1);
    }
    return array;
  },
  
  addBook: function(book) {
  	$.ajax({
      url: document.location.origin + "/books/user/add/",
      dataType: 'json',
      method: 'POST',
      data: {book: book},
      success: function(data) {
      	if (data.error) {
      		this.setState({error: data.error});
      	} else {
      		var myCopies = this.state.myCopies;
	      	var suggestedBooks = this.state.suggestedBooks;
	      	var topCopies = this.state.topCopies;
	      	myCopies.push(data.copy);
	      	topCopies.push(data.copy);
	      	suggestedBooks = this.removeItemFromArray(suggestedBooks,"book_id",data.copy.book_id);
	      	this.setState({
	      		myCopies: myCopies, topCopies: topCopies, 
	      		suggestedBooks: suggestedBooks, error: ""
	      	});
      	}
      }.bind(this),
      error: function(xhr, status, err) {
      	this.setState({error: "Unable to send network request. Please reload the page or try again."});
      }.bind(this)
    });
  },
  
  removeCopy: function(copy_id) {
  	$.ajax({
      url: document.location.origin + "/books/user/remove/",
      dataType: 'json',
      method: 'POST',
      data: {copy_id: copy_id},
      success: function(data) {
      	if (data.error) {
      		this.setState({error: data.error});
      	} else {
      		var myCopies = this.state.myCopies;
      		var requestsForMine = this.state.requestsForMine;
	      	var topCopies = this.state.topCopies;
	      	myCopies = this.removeItemFromArray(myCopies,"copy_id",copy_id);
	      	requestsForMine = this.removeItemFromArray(requestsForMine,"copy_id",copy_id);
	      	topCopies = this.removeItemFromArray(topCopies,"copy_id",copy_id);
	      	this.setState({
	      		myCopies: myCopies, requestsForMine: requestsForMine, 
	      		topCopies: topCopies, error: ""
	      	});
      	}
      }.bind(this),
      error: function(xhr, status, err) {
      	this.setState({error: "Unable to send network request. Please reload the page or try again."});
      }.bind(this)
    });
  },
  
  clearSuggested: function() {
  	this.setState({suggestedBooks: []});
  },
  
  toggleRequest: function(copy, username, cancel) {
  	$.ajax({
      url: document.location.origin + "/books/request/",
      dataType: 'json',
      method: 'POST', 
      data: {copy_id: copy.copy_id, username: username, cancel: cancel}, 
      success: function(data) {
      	if (data.error) {
      		this.setState({error: data.error});
      	} else {
      		var myRequests = this.state.myRequests;
      		var requestsForMine = this.state.requestsForMine;
	      	var topCopies = this.state.topCopies;
	      	var tradeOptions = this.state.tradeOptions;
	      	if (cancel === "false") {
	      		copy.requested_by = username;
	      		myRequests.push(copy);
	      		topCopies = this.removeItemFromArray(topCopies,"copy_id",copy.copy_id);
	      	} else {
	      		copy.requested_by = "none";
	      		topCopies.push(copy);
	      		myRequests = this.removeItemFromArray(myRequests,"copy_id",copy.copy_id);
	      		requestsForMine = this.removeItemFromArray(requestsForMine,"copy_id",copy.copy_id);
	      		tradeOptions = [];
	      	}
	      	this.setState({
	      		myRequests: myRequests, requestsForMine: requestsForMine, 
	      		topCopies: topCopies, tradeOptions: tradeOptions, error: ""
	      	});
      	}
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({error: "Unable to send network request. Please reload the page or try again."});
      }.bind(this)
    });
  },
  
  viewTradeOpts: function(myTrade,username) {
  	$.ajax({
      url: document.location.origin + "/books/options/?username=" + username,
      dataType: 'json',
      success: function(data) {
      	if (data.error) {
      		this.setState({error: data.error});
      	} else {
      		this.setState({tradeOptions: data.tradeOptions, myTrade: myTrade, error: ""});
      	}
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({error: "Unable to send network request. Please reload the page or try again."});
      }.bind(this)
    });
  },
  
  tradeCopies: function(otherTrade) {
  	$.ajax({
      url: document.location.origin + "/books/trade/",
      dataType: 'json',
      method: 'POST',
      data: {myTrade: this.state.myTrade, otherTrade: otherTrade},
      success: function(data) {
      	if (data.error) {
      		this.setState({error: data.error});
      	} else {
      		this.getUserData();
      		this.getTopBooks(0);
      		this.setState({tradeOptions: []});
      	}
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({error: "Unable to send network request. Please reload the page or try again."});
      }.bind(this)
    });
  },
  
  render: function(){
  	var errorSect;
  	if (this.state.error != "") {
  		errorSect = 
  		<div className="error">ERROR: {this.state.error}</div>;
  	}
  	
  	var tabSect = 
  	<div className="tabLabelSect">
	    <div className="activeTabLabel" onClick={()=>this.toggleTabVis("home")}>HOME</div>
	  </div>;
  	if (this.state.user.username) {
  		tabSect = 
  		<div className="tabLabelSect">
	    	<div 
	    		className={(this.state.visible==="home") ? "activeTabLabel" : "inactiveTabLabel"} 
	    		onClick={()=>this.toggleTabVis("home")}
	    	>HOME</div>
	    	<div 
	    		className={(this.state.visible==="profile") ? "activeTabLabel" : "inactiveTabLabel"} 
	    		onClick={()=>this.toggleTabVis("profile")}
	    	>PROFILE</div>
	    	<div 
	    		className={(this.state.visible==="trades") ? "activeTabLabel" : "inactiveTabLabel"} 
	    		onClick={()=>this.toggleTabVis("trades")}
	    	>TRADES</div>
	    </div>;
  	}
  	
  	var tab;
  	if (this.state.visible === "home") {
  		tab = 
  		<HomeTab 
  			user={this.state.user}
  			topCopies={this.state.topCopies}
  			numFetched={this.state.numFetched}
  			getTopBooks={this.getTopBooks}
  			toggleRequest={this.toggleRequest}
  		/>;
  	} else if (this.state.visible === "profile") {
  		tab = 
  		<ProfileTab
	      user={this.state.user}
	      updateFullName={this.updateFullName}
	    	updateCity={this.updateCity}
	    	updateState={this.updateState}
	    	updateProfile={this.updateProfile}
	    	searchTextVal={this.state.searchTextVal}
	    	searchNumVal={this.state.searchNumVal}
	    	updateSearchTextVal={this.updateSearchTextVal}
	    	updateSearchNumVal={this.updateSearchNumVal}
	    	searchByText={this.searchByText}
	    	searchByNum={this.searchByNum}
	    	suggestedBooks={this.state.suggestedBooks}
	    	addBook={this.addBook}
	    	clearSuggested={this.clearSuggested}
	    	myCopies={this.state.myCopies}
	    	removeCopy={this.removeCopy}
	    />;
  	} else {
  		tab = 
  		<TradesTab
  			user={this.state.user}
  			myRequests={this.state.myRequests}
  			requestsForMine={this.state.requestsForMine}
	    	toggleRequest={this.toggleRequest}
	    	tradeOptions={this.state.tradeOptions}
	    	viewTradeOpts={this.viewTradeOpts}
	    	tradeCopies={this.tradeCopies}
	    	myTrade={this.state.myTrade}
  		/>;
  	}
    return (
    	<div>
    		{errorSect}
	    	{tabSect}
	    	{tab}
	    </div>
    );
  }
});

/******************************************************************/
/* [1] < HOME TAB /> IN BOOK APP */
/******************************************************************/

var HomeTab = React.createClass({
  render: function(){
    return (
    	<div className="tabContents">
    		<div className="tabHeader">Search for Books</div>
    		<div className="appIntro">
    			Welcome to our Book Trading App! As an authorized user, you can search 
    			for your own books using the Google Books API and add them to your  
    			inventory. You can find books owned by other people, and you can request 
    			a trade. If the other user agrees to the trade, they can make an exchange 
    			for one of your books, or they can give you the book for free! 
    			In this app, all trades are virtual. In a real production app, there would 
    			be methods to deal with addresses, confirmation of shipping, etc., 
    			but we take all of the challenges out of managing your trades. Enjoy!
    		</div>
	    	<TopCopies
	    		user={this.props.user}
	    		topCopies={this.props.topCopies}
	    		numFetched={this.props.numFetched}
	    		getTopBooks={this.props.getTopBooks}
	    		toggleRequest={this.props.toggleRequest}
	    	/>
	    </div>
    );
  }
});

/******************************************************************/
/* [1] < PROFILE TAB /> IN BOOK APP */
/******************************************************************/

var ProfileTab = React.createClass({
  render: function(){
    return (
    	<div className="tabContents">
    		<div className="tabHeader">Your Profile</div>
	    	<ProfileSect
	    		user={this.props.user}
	    		updateFullName={this.props.updateFullName}
	    		updateCity={this.props.updateCity}
	    		updateState={this.props.updateState}
	    		updateProfile={this.props.updateProfile}
	    	/>
	      <AddBooks
	      	searchTextVal={this.props.searchTextVal}
	      	searchNumVal={this.props.searchNumVal}
	      	updateSearchTextVal={this.props.updateSearchTextVal}
	      	updateSearchNumVal={this.props.updateSearchNumVal}
	      	searchByText={this.props.searchByText}
	      	searchByNum={this.props.searchByNum}
	      	suggestedBooks={this.props.suggestedBooks}
	      	addBook={this.props.addBook}
	      	clearSuggested={this.props.clearSuggested}
	      />
	      <MyCopies
	      	myCopies={this.props.myCopies}
	      	removeCopy={this.props.removeCopy}
	      />
	    </div>
    );
  }
});

/******************************************************************/
/* [1] < TRADES TAB /> IN BOOK APP */
/******************************************************************/

var TradesTab = React.createClass({
  render: function(){
    return (
    	<div className="tabContents">
    		<div className="tabHeader">Manage Your Trades</div>
	    	<MyRequests 
	    		user={this.props.user}
	    		myRequests={this.props.myRequests}
	    		toggleRequest={this.props.toggleRequest}
	    	/>
	    	<RequestsForMine 
	    		user={this.props.user}
	    		requestsForMine={this.props.requestsForMine}
	    		toggleRequest={this.props.toggleRequest}
	    		viewTradeOpts={this.props.viewTradeOpts}
	    		myTrade={this.props.myTrade}
	    	/>
	    	<TradeOptions 
	    		tradeOptions={this.props.tradeOptions}
	    		tradeCopies={this.props.tradeCopies}
	    	/>
	    </div>
    );
  }
});

/******************************************************************/
/* [2] < TOP COPIES /> IN HOME TAB */
/******************************************************************/

var TopCopies = React.createClass({
  render: function(){
  	var user = this.props.user;
  	var topCopies = this.props.topCopies;
  	var getTopBooks = this.props.getTopBooks;
  	var toggleRequest = this.props.toggleRequest;
    var topThumbs = <span>No books are available for trade yet.</span>;
    if (topCopies.length > 0) {
    	if (user.username) {
    		topThumbs = topCopies.map(function(copy) {
    			var labelA = "REQUEST";
    			if (copy.username === user.username) {labelA = "NONE";}
		    	return (
		        <ViewBook 
		        	class="book" 
		        	book={copy}
		        	behaviorA={()=>toggleRequest(copy,user.username,"false")}
		        	labelA={labelA}
		        	behaviorB="return false"
		        	labelB="NONE"
		        />
		      );
		    });
    	} else {
    		topThumbs = topCopies.map(function(copy) {
		    	return (
		        <ViewBook 
		        	class="book" 
		        	book={copy}
		        	behaviorA="return false"
		        	labelA="NONE"
		        	behaviorB="return false"
		        	labelB="NONE"
		        />
		      );
		    });
    	}
	    topThumbs.push(
	    	<button className="seeMore" onClick={()=>getTopBooks(20)}>SEE MORE</button>
	    );
    }
    return (
      <div className="bookSect">
      	<div className="bookSectHeader">Books Available For Trade</div>
        <div className="thumbSect">
        	{topThumbs}
        </div>
      </div>
    );
  }
});

/******************************************************************/
/* [2] < PROFILE SECT /> IN PROFILE TAB */
/******************************************************************/

var ProfileSect = React.createClass({
  render: function(){
    return (
      <div className="profile">
        <div className="greeting">Hello {this.props.user.username}!</div>
        <label>Full Name</label>
        <input 
        	value={this.props.user.fullname}
					onChange={this.props.updateFullName}
        />
        <label>City</label>
        <input 
        	value={this.props.user.city}
					onChange={this.props.updateCity}
        />
        <label>State</label>
        <input 
        	value={this.props.user.state}
					onChange={this.props.updateState}
        />
        <button onClick={this.props.updateProfile}>UPDATE</button>
      </div>
    );
  }
});

/******************************************************************/
/* [2] < ADD BOOKS /> IN PROFILE TAB */
/******************************************************************/

var AddBooks = React.createClass({
  render: function(){
  	var addBook = this.props.addBook;
    var suggestedBooks = this.props.suggestedBooks;
    var suggestedThumbs = <span>Search to find copies of books you own</span>;
    if (suggestedBooks.length > 0) {
	    suggestedThumbs = suggestedBooks.map(function(book) {
	    	return (
	        <ViewBook 
	        	class="book" 
	        	book={book}
	        	behaviorA={()=>addBook(book)}
	        	labelA="ADD"
	        	behaviorB="return false"
		        labelB="NONE"
	        />
	      );
	    });
	    suggestedThumbs.unshift(
	    	<button className="clearSuggested" onClick={this.props.clearSuggested}>CLEAR</button>
	    );
    }
    return (
      <div className="addBooks">
      	<div className="addBooksHeader">Add Books to Your Collection</div>
        <div className="searchSect">
        	<div className="searchSubheader">Search By Title or Author</div>
          <input 
          	className="searchInput" 
          	value={this.props.searchTextVal} 
          	onChange={this.props.updateSearchTextVal}
          ></input>
          <button 
          	className="searchBtn" 
          	onClick={this.props.searchByText}
          >Search</button>
        </div>
        <div className="searchSect">
        	<div className="searchSubheader">Search By ISBN13</div>
          <input 
          	className="searchInput"
          	value={this.props.searchNumVal} 
          	onChange={this.props.updateSearchNumVal}
          ></input>
          <button 
          	className="searchBtn" 
          	onClick={this.props.searchByNum}
          >Search</button>
        </div>
        <div className="bookSect">
        	<div className="bookSectHeader">Search Results</div>
        	<div className="thumbSect">
        		{suggestedThumbs}
        	</div>
        </div>
      </div>
    );
  }
});

/******************************************************************/
/* [2] < MY COPIES /> IN PROFILE TAB */
/******************************************************************/

var MyCopies = React.createClass({
  render: function(){
  	var removeCopy = this.props.removeCopy;
    var myCopies = this.props.myCopies;
    var myThumbs = <span>You haven't added any books yet.</span>;
    if (myCopies.length > 0) {
	    myThumbs = myCopies.map(function(copy) {
	    	return (
	        <ViewBook 
	        	class="book" 
	        	book={copy}
	        	behaviorA={()=>removeCopy(copy.copy_id)}
	        	labelA="REMOVE"
	        	behaviorB="return false"
		        labelB="NONE"
	        />
	      );
	    });
    }
    return (
      <div className="bookSect">
      	<div className="bookSectHeader">Your Book Collection</div>
        <div className="thumbSect">
        	{myThumbs}
        </div>
      </div>
    );
  }
});

/******************************************************************/
/* [2] < MY REQUESTS /> IN TRADES TAB */
/******************************************************************/

var MyRequests = React.createClass({
  render: function(){
  	var user = this.props.user;
  	var myRequests = this.props.myRequests;
  	var toggleRequest = this.props.toggleRequest;
    var reqThumbs = <span>You don't have any outstanding requests.</span>;
    if (myRequests.length > 0) {
    	reqThumbs = myRequests.map(function(copy) {
    		return (
		    	<ViewBook 
		    		class="book" 
		      	book={copy}
		        behaviorA={()=>toggleRequest(copy,user.username,"true")}
		        labelA="CANCEL"
		        behaviorB="return false"
		        labelB="NONE"
		      />
		    );
		  });
    }
    return (
      <div className="bookSect">
      	<div className="bookSectHeader">Your Requests, Awaiting Approval</div>
        <div className="thumbSect">
        	{reqThumbs}
        </div>
      </div>
    );
  }
});

/******************************************************************/
/* [2] < REQUESTS FOR MINE /> IN TRADES TAB */
/******************************************************************/

var RequestsForMine = React.createClass({
  render: function(){
  	var user = this.props.user;
  	var requestsForMine = this.props.requestsForMine;
  	var viewTradeOpts = this.props.viewTradeOpts;
  	var myTrade = this.props.myTrade;
  	var toggleRequest = this.props.toggleRequest;
    var reqThumbs = <span>No one has requested one of your books yet.</span>;
    if (requestsForMine.length > 0) {
    	reqThumbs = requestsForMine.map(function(copy) {
    		return (
		    	<ViewBook 
		    		class={(myTrade.copy_id === copy.copy_id) ? "book highlight" : "book"}
		      	book={copy}
		        behaviorA={()=>viewTradeOpts(copy,copy.requested_by)}
		        labelA="SEE OPTIONS"
		        behaviorB={()=>toggleRequest(copy,user.username,"true")}
		        labelB="DECLINE"
		      />
		    );
		  });
    }
    return (
      <div className="bookSect">
      	<div className="bookSectHeader">Copies of Your Books that Others Have Requested</div>
        <div className="thumbSect">
        	{reqThumbs}
        </div>
      </div>
    );
  }
});

/******************************************************************/
/* [2] < TRADE OPTIONS /> IN TRADES TAB */
/******************************************************************/

var TradeOptions = React.createClass({
  render: function(){
  	var tradeOptions = this.props.tradeOptions;
  	var tradeCopies = this.props.tradeCopies;
  	var optThumbs = <span>Click on one of your incoming trade requests to see your options.</span>;
    if (tradeOptions.length > 0) {
    	optThumbs = tradeOptions.map(function(copy) {
    		return (
		    	<ViewBook 
		    		class="book" 
		      	book={copy}
		        behaviorA={()=>tradeCopies(copy)}
		        labelA="TRADE FOR THIS"
		        behaviorB="return false"
		        labelB="NONE"
		      />
		    );
		  });
		  optThumbs.unshift(
		  	<button className="tradeForNone" onClick={()=>tradeCopies(null)}>TRADE FOR FREE</button>
		  );
    }
    return (
      <div className="bookSect">
      	<div className="bookSectHeader">Books You Can Get If You Agree</div>
        <div className="thumbSect">
        	{optThumbs}
        </div>
      </div>
    );
  }
});

/******************************************************************/
/* [3] < VIEW BOOK /> IN MULTIPLE COMPONENTS */
/******************************************************************/

var ViewBook = React.createClass({
  render: function(){
  	var buttonA, buttonB;
  	if (this.props.labelA != "NONE") {
  		buttonA = 
  		<div className="behaviorA">
  			<button onClick={this.props.behaviorA}>{this.props.labelA}</button>
  		</div>;
  	}
  	if (this.props.labelB != "NONE") {
  		buttonB = 
  		<div className="behaviorB">
  			<button onClick={this.props.behaviorB}>{this.props.labelB}</button>
  		</div>;
  	}
  	var bookOwner, bookCity, bookState;
  	if (this.props.book.username) {
  		bookOwner = this.props.book.username;
  		if (this.props.book.fullname != "") {bookOwner = this.props.book.fullname;}
  		if (this.props.book.city != "") {bookCity = this.props.book.city;}
  		if (this.props.book.state != "") {bookState = this.props.book.state;}
  	}
    return (
      <div className={this.props.class}>
        {buttonB}
        <div className="thumbnail">
        	<a href={this.props.book.info_url} target="_blank">
        		<img alt={this.props.book.title} src={this.props.book.image_url}/>
        	</a>
        </div>
        <div className="bookDetails">
        	<div className="bookTitle">{this.props.book.title}</div>
        	<div className="bookAuthors">{this.props.book.authors}</div>
        	<div className="bookOwner">{bookOwner}</div>
        	<div className="bookLocation">{bookCity} {bookState}</div>
        </div>
        {buttonA}
      </div>
    );
  }
});

/******************************************************************/
/* RENDER */
/******************************************************************/

ReactDOM.render(
  <BookApp />,
  document.getElementById('contentSect')
);


