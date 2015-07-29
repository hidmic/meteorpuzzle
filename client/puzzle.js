Meteor.subscribe('pieces');

//Method stubs
Meteor.methods({   
    move: function(pieceId, deltaX, deltaY) {
	var piece = pieces.findOne(pieceId);
	if (piece.ownedBy != this.userId) {
	    throw new Meteor.Error("piece-not-owned", "The piece doesn't belong to you!");
	}		
	piece.currLoc = transform(piece.currLoc, function(x, y) { return [x+deltaX, y+deltaY]; });
	pieces.update(pieceId, piece);	
    }
});

Template.body.events({
   'resize':
});


//Puzzle
Template.puzzle.events({
    'mousemove': function() {
	var lastX;
	var lastY;
	
	return function(event) {
	    var pieceId = Session.get('piece');
	    if (pieceId != undefined) {
		Meteor.call('move', pieceId, event.clientX - lastX, event.clientY - lastY, function(error) {
		    if (error) {
			Session.set("errorMsg", error.reason);
			return;
		    }				    
		});
	    }		
	    lastX = event.clientX;
	    lastY = event.clientY;
	}
    }()
});

Template.puzzle.helpers({
    message: function() {
	return Session.get('message');
    }
});

//Pieces
Template.piece.events({
    'mousedown': function(event) {
	Meteor.call('take', event.currentTarget.id, function(error) {
	    if (error) {		
		Session.set("errorMsg", error.reason);
		return;
	    }
	    Session.set('piece', event.currentTarget.id);
	});    	    
    },
    'mouseup': function(event) {
    	var pieceId = Session.get('pieceId');		
	if (pieceId != undefined) {
	    Meteor.call('give', pieceId, function(error) {
		if (error) {		
		    Session.set("errorMsg", error.reason);
		    return;		    
		}
		Session.set('pieceId', undefined);	    
	    });    	    	
	}
    }
});

Template.pieces.helpers({           
    top: function() {
    	return this.currPos[1];
    },
    left: function() {    	
	return this.currPos[0];		
    }            
});


Meteor.startup(function(){
    window.onresize = function(event){
   	Session.set("",);
    };
});


