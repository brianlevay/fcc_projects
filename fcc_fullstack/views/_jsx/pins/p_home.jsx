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
  getInitialState: function() {
  	var path = this.getPath();
    return { 
    	path: path, user:{}, error: "", 
    	topWalls: {topCount: 10, walls:[]}, 
    	collection: {username:"", walls:[]}, 
    	wall: {wall_id: "", username:"", wallname:"", pins:[]}, 
    	newWallName: "", image_url: "", comment: ""
    };
  },
  
  componentDidMount: function(){
  	this.getUser();
  	this.getDataForPath(this.state.path);
    window.addEventListener('hashchange', this.onHashChange);
    $('img').on('error',function(){
  		this.src = document.location.origin + '/_img/pins/placeholder_400x400.jpg';
  	});
  },
  
  componentDidUpdate: function(){
  	$('img').on('error',function(){
  		this.src = document.location.origin + '/_img/pins/placeholder_400x400.jpg';
  	});
  },
  
  getPath: function() {
    var path = ["",""];
    var hash = document.location.hash;
    var hashArr = hash.split("/");
    for (var i=1, len=hashArr.length; i<len; i++) {
      path[i-1] = hashArr[i]; 
    }
    return path;
  },
  
  setPath: function(path) {
    var hash = "/";
    if (path[0] != "") {hash += path[0] + "/";}
    if (path[1] != "") {hash += path[1] + "/";}
    document.location.hash = hash;
    this.setState({path: path});
    this.getDataForPath(path);
  },
  
  onHashChange: function() {
  	var path = this.getPath();
  	if (path[0] != this.state.path[0] || path[1] != this.state.path[1]) {
  		this.setPath(path);
  	}
  },
  
  getUser: function() {
  	$.ajax({
      url: document.location.origin + "/pins/api/user/",
      dataType: 'json',
      success: function(data) {
      	if (data.user) {
      		this.setState({user: data.user});
      	}
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({error: "Unable to send network request. Please reload the page or try again."});
      }.bind(this)
    });
  },

	getTop: function(add) {
  	var topCount = this.state.topWalls.topCount + add;
  	$.ajax({
      url: document.location.origin + "/pins/api/top/?num=" + topCount,
      dataType: 'json',
      success: function(data) {
      	if (data.error) {
      		this.setState({error: data.error});
      	} else {
      		this.setState({topWalls: data.topWalls, error: ""});
      	}
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({error: "Unable to send network request. Please reload the page or try again."});
      }.bind(this)
    });
  },
  
  getCollection: function(username) {
  	$.ajax({
      url: document.location.origin + "/pins/api/data/" + username,
      dataType: 'json',
      success: function(data) {
      	if (data.error) {
      		this.setState({error: data.error});
      		if (data.error == "No such user") {this.setPath(["",""]);}
      	} else {
	      	this.setState({collection: data.collection, error: ""});
      	}
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({error: "Unable to send network request. Please reload the page or try again."});
      }.bind(this)
    });
  },
  
  getWall: function(username, wall) {
  	$.ajax({
      url: document.location.origin + "/pins/api/data/" + username + "/" + wall,
      dataType: 'json',
      success: function(data) {
      	if (data.error) {
      		this.setState({error: data.error});
      		if (data.error == "No such user") {this.setPath(["",""]);}
      		if (data.error == "Wall does not exist") {this.setPath([username,""]);}
      	} else {
	      	this.setState({wall: data.wall, error: ""});
      	}
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({error: "Unable to send network request. Please reload the page or try again."});
      }.bind(this)
    });
  },
  
  getDataForPath: function(path) {
  	if (path[0] === "" && path[1] === "") {
  		this.getTop(0);
  	} else if (path[0] != "" && path[1] === "") {
  		this.getCollection(path[0]);
  	} else if (path[0] != "" && path[1] != "") {
  		this.getWall(path[0],path[1]);
  	}
  },
    
  updateNewWallName: function(e) {
    this.setState({newWallName: e.target.value});
  },
  
  createWall: function() {
  	$.ajax({
      url: document.location.origin + "/pins/api/walls/create/" + this.state.newWallName,
      dataType: 'json',
      success: function(data) {
      	if (data.error) {
      		this.setState({error: data.error});
      	} else {
      		var wall = {wall_id: data.wall_id, wallname: this.state.newWallName, username: this.state.user.username, pins: []};
      		this.setPath([this.state.user.username,this.state.newWallName]);
      		this.setState({wall: wall, newWallName: ""});
      	}
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({error: "Unable to send network request. Please reload the page or try again."});
      }.bind(this)
    });
  },
  
  deleteWall: function(wallname) {
  	var ask = confirm("Are you sure you want to delete this wall?");
  	if (ask === true) {
	  	$.ajax({
	      url: document.location.origin + "/pins/api/walls/delete/" + wallname,
	      dataType: 'json',
	      success: function(data) {
	      	if (data.error) {
	      		this.setState({error: data.error});
	      	} else {
		      	this.setPath([this.state.user.username,""]);
	      	}
	      }.bind(this),
	      error: function(xhr, status, err) {
	        this.setState({error: "Unable to send network request. Please reload the page or try again."});
	      }.bind(this)
	    });
  	}
  },
  
  updateImageURL: function(e) {
    this.setState({image_url: e.target.value});
  },
  
  updateComment: function(e) {
    this.setState({comment: e.target.value});
  },
  
  addPin: function() {
  	$.ajax({
      url: document.location.origin + "/pins/api/pins/add/",
      dataType: 'json',
      method: 'post',
      data: {username: this.state.wall.username, wall_id: this.state.wall.wall_id, image_url: this.state.image_url, comment: this.state.comment},
      success: function(data) {
      	if (data.error) {
      		this.setState({error: data.error});
      	} else {
	      	this.setPath([this.state.path[0],this.state.path[1]]);
	      	this.setState({image_url: "", comment: "", error: ""});
      	}
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({error: "Unable to send network request. Please reload the page or try again."});
      }.bind(this)
    });
  },
  
  removePin: function(pin_id) {
  	$.ajax({
      url: document.location.origin + "/pins/api/pins/remove/",
      dataType: 'json',
      method: 'post',
      data: {username: this.state.wall.username, pin_id: pin_id},
      success: function(data) {
      	if (data.error) {
      		this.setState({error: data.error});
      	} else {
	      	this.setPath([this.state.path[0],this.state.path[1]]);
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
	    <div 
	    	className={(this.state.path[0] === "") ? "activeTabLabel" : "inactiveTabLabel"} 
	    	onClick={()=>this.setPath(["",""])}
	    >HOME</div>
	  </div>;
	  
  	if (this.state.user.username) {
  		tabSect = 
  		<div className="tabLabelSect">
	    	<div 
	    		className={(this.state.path[0] === "") ? "activeTabLabel" : "inactiveTabLabel"} 
	    		onClick={()=>this.setPath(["",""])}
	    	>HOME</div>
	    	<div 
	    		className={(this.state.path[0] === this.state.user.username && this.state.path[1] === "") ? "activeTabLabel" : "inactiveTabLabel"} 
	    		onClick={()=>this.setPath([this.state.user.username,""])}
	    	>PROFILE</div>
	    </div>;
  	}
  	
  	var tab = 
  	<HomeTab
  		user={this.state.user}
  		path={this.state.path}
  		setPath={this.setPath}
  		topWalls={this.state.topWalls}
  		getTop={this.getTop}
  	/>;
  	if (this.state.path[0] != "") {
  		tab = 
  		<UserTab
  			user={this.state.user}
  			path={this.state.path}
  			setPath={this.setPath}
  			collection={this.state.collection}
  			newWallName={this.state.newWallName}
  			updateNewWallName={this.updateNewWallName}
  			createWall={this.createWall}
  		/>;
  	}
  	if (this.state.path[1] != "") {
  		tab = 
  		<WallTab
  			user={this.state.user}
  			path={this.state.path}
  			setPath={this.setPath}
  			wall={this.state.wall}
  			deleteWall={this.deleteWall}
  			image_url={this.state.image_url}
  			comment={this.state.comment}
  			updateImageURL={this.updateImageURL}
  			updateComment={this.updateComment}
  			addPin={this.addPin}
  			removePin={this.removePin}
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
/* [1] < HOME TAB /> IN PHOTO APP */
/******************************************************************/

var HomeTab = React.createClass({
  render: function(){
    return (
    	<div className="tabContents">
    		<div className="tabHeader">Previews of Recently Active Walls</div>
    		<div className="appIntro">
    			Welcome to our Photo Pinning App! You can create your own walls, add links to your favorite photos, and browse other users' walls. 
    		</div>
    		<WallSet
    			setPath={this.props.setPath}
    			wallSet={this.props.topWalls}
    		/>
    		<button className="seeMore" onClick={()=>this.props.getTop(10)}>SEE MORE</button>
	    </div>
    );
  }
});

/******************************************************************/
/* [1] < USER TAB /> IN PHOTO APP */
/******************************************************************/

var UserTab = React.createClass({
  render: function(){
  	var create;
  	if (this.props.user.username && this.props.user.username === this.props.path[0]) {
  		create = 
  		<CreateWall
	    	newWallName={this.props.newWallName}
  			updateNewWallName={this.props.updateNewWallName}
  			createWall={this.props.createWall}
	    />;
  	}
    return (
    	<div className="tabContents">
    		<div className="tabHeader">Previews of {this.props.path[0]}'s Walls</div>
    		{create}
    		<WallSet
    			setPath={this.props.setPath}
    			wallSet={this.props.collection}
    		/>
	    </div>
    );
  }
});

/******************************************************************/
/* [1] < WALL TAB /> IN PHOTO APP */
/******************************************************************/

var WallTab = React.createClass({
  render: function(){
  	var creator = this.props.path[0];
  	var wallname = this.props.path[1];
  	var deleteWall, addPin;
  	if (this.props.user.username && this.props.user.username === creator) {
  		deleteWall = 
  		<button className="deleteWall" onClick={()=>this.props.deleteWall(wallname)}>DELETE WALL</button>;
  		
  		addPin = 
  		<AddPin
  			image_url={this.props.image_url}
  			comment={this.props.comment}
  			updateImageURL={this.props.updateImageURL}
  			updateComment={this.props.updateComment}
  			addPin={this.props.addPin}
  		/>;
  	}
    return (
    	<div className="tabContents">
    		<div className="tabHeader">{this.props.wall.wallname}</div>
    		<div className="tabSubheader" onClick={()=>this.props.setPath([this.props.path[0],""])}>Created by: 
    			<span>{this.props.wall.username}</span>
    		</div>
    		{deleteWall}
    		{addPin}
    		<FullWall
    			user={this.props.user}
    			wall={this.props.wall}
    			removePin={this.props.removePin}
    		/>
	    </div>
    );
  }
});

/******************************************************************/
/* [2] < WALL SET /> IN HOME TAB, USER TAB */
/******************************************************************/

var WallSet = React.createClass({
  render: function(){
  	var setPath = this.props.setPath;
  	var wallSet = this.props.wallSet;
  	var walls = wallSet.walls;
  	var wallThumbs = <span>No walls have been created by this user yet.</span>;
    if (walls.length > 0) {
	    wallThumbs = walls.map(function(wall) {
	    	return (
	        <WallPreview 
	        	setPath={setPath}
	        	wall={wall}
	        />
	      );
	    });
    }
    return (
    	<div className="wallSet">
    		{wallThumbs}
	    </div>
    );
  }
});

/******************************************************************/
/* [2] < CREATE WALL /> IN PHOTO APP */
/******************************************************************/

var CreateWall = React.createClass({
  render: function(){
    return (
    	<div className="createWall">
    		<div className="createWallHeader">Create Wall Section</div>
    		<label>Wall Name</label>
        <input 
        	value={this.props.newWallName}
					onChange={this.props.updateNewWallName}
        />
        <button onClick={this.props.createWall}>CREATE</button>
	    </div>
    );
  }
});


/******************************************************************/
/* [2] < ADD PIN /> IN WALL TAB */
/******************************************************************/

var AddPin = React.createClass({
  render: function(){
    return (
    	<div className="addPin">
    		<div className="addPinHeader">Add New Pin</div>
    		<div className="addPinInputSect">
    			<label>Image Link</label>
    			<input value={this.props.image_url} onChange={this.props.updateImageURL}/>
    			<label>Description</label>
    			<input value={this.props.comment} onChange={this.props.updateComment}/>
    			<button onClick={this.props.addPin}>ADD</button>
    		</div>
	    </div>
    );
  }
});

/******************************************************************/
/* [2] < FULL WALL /> IN WALL TAB */
/******************************************************************/

var FullWall = React.createClass({
  render: function(){
  	var user = this.props.user;
  	var pins = this.props.wall.pins;
  	var creator = this.props.wall.username;
  	var removePin = this.props.removePin;
    var pinThumbs = <span>No pins have been added yet.</span>;
    if (pins.length > 0) {
	    pinThumbs = pins.map(function(pin) {
	    	return (
	        <ViewPin 
	        	user={user}
	        	pin={pin}
	        	creator={creator}
	        	behavior={()=>removePin(pin.pin_id)}
	        />
	      );
	    });
    }
    return (
    	<div className="fullWall">
    		{pinThumbs}
	    </div>
    );
  }
});

/******************************************************************/
/* [3] < WALL PREVIEW /> IN TOP WALLS */
/******************************************************************/

var WallPreview = React.createClass({
  render: function(){
  	var pins = this.props.wall.pins;
  	var creator = this.props.wall.username;
    var pinThumbs = [];
    var pinNum = Math.min(pins.length,6);
    if (pinNum > 0) {
    	for (var n = 0; n < pinNum; n++) {
    		pinThumbs.push(
    			<ViewPin
    				pin={pins[n]}
    				creator={creator}
    			/>
    		);
    	}
    } else {
    	pinThumbs = <span>No pins have been added to this wall yet.</span>;
    }
    return (
    	<div className="wallPreview">
    		<div className="wallPreviewHeader"
    			onClick={()=>this.props.setPath([this.props.wall.username,this.props.wall.wallname])}
    		>{this.props.wall.wallname}</div>
    		<div className="wallPreviewSubheader"
    			onClick={()=>this.props.setPath([this.props.wall.username,""])}
    		>{this.props.wall.username}</div>
    		{pinThumbs}
	    </div>
    );
  }
});

/******************************************************************/
/* [3 / 4] < VIEW PIN /> IN FULL WALL, WALL PREVIEW */
/******************************************************************/

var ViewPin = React.createClass({
  render: function(){
  	var button;
		if (this.props.user && this.props.user.username === this.props.creator && this.props.behavior) {
			button = 
			<button onClick={this.props.behavior}>REMOVE</button>;
		}
    return (
    	<div className="pin">
    		{button}
    		<div className="imageDiv">
    			<img src={this.props.pin.image_url} alt={this.props.pin.comment}/>
    		</div>
    		<div className="comment">{this.props.pin.comment}</div>
    		<div className="creator">{this.props.creator}</div>
	    </div>
    );
  }
});

/******************************************************************/
/* RENDER */
/******************************************************************/

ReactDOM.render(
  <PhotoApp />,
  document.getElementById('contentSect')
);


