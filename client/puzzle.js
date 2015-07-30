//Collections

var Puzzles = new Mongo.Collection('allpuzzles');
var Pieces = new Mongo.Collection('allpieces');

//Subscriptions
var PuzzleSubscription = Meteor.subscribe('puzzles');
var PieceSubscription = Meteor.subscribe('pieces');

//Method stubs
Meteor.methods({   
    move: function(pieceId, deltaX, deltaY) {
	var piece = Pieces.findOne(pieceId);
	if (piece.ownedBy != this.userId) {
	    throw new Meteor.Error("piece-not-owned", "The piece doesn't belong to you!");
	}		
	piece.position = [piece.position[0] + deltaX, piece.position[1] + deltaY];
	Pieces.update(pieceId, piece);	
    }
});

//Body
Template.body.helpers({
    ready: function(){
	return PuzzleSubscription.ready() && PieceSubscription.ready();
    },
    puzzle: function() {	
	return Puzzles.findOne();
    }
});

//Puzzle
Template.puzzleTemplate.events({
    'mousemove': function() {
	var lastX;
	var lastY;
	
	return function(event) {
	    var pieceId = Session.get('piece');
	    if (pieceId != undefined) {
		Meteor.call('move', pieceId, event.clientX - lastX, event.clientY - lastY, function(error) {
		    if (error) {
			Session.set("message", {type: 'error',  content: 'error.reason'});
			return;
		    }				    
		});
	    }		
	    lastX = event.clientX;
	    lastY = event.clientY;
	}
    }()
});

Template.puzzleTemplate.helpers({    
    pieces: function() {	
	return Pieces.find({puzzleId: {$eq: this._id}});
    }
});

//Arrangement
Template.arrangeTemplate.helpers({
   left: function(){
       return this.position[0];
   },
   top: function(){
       return this.position[1];
   }  
});

//Pieces
Template.pieceTemplate.events({
    'mousedown': function(event) {
	Meteor.call('take', event.currentTarget.id, function(error) {
	    if (error) {		
		Session.set("message", {type: 'error', content: error.reason});
		return;
	    }
	    Session.set('piece', event.currentTarget.id);
	});    	    
    },
    'mouseup': function(event) {
    	var pieceId = Session.get('piece');		
	if (pieceId != undefined) {
	    Meteor.call('give', pieceId, function(error) {
		if (error) {		
		    Session.set("message", {type: 'error', content: error.reason});
		    return;		    
		}
		Session.set('piece', undefined);	    
	    });    	    	
	}
    }
});

Template.pieceTemplate.helpers({           
    top: function() {
	console.log(this);
    	return this.position[1];
    },
    left: function() {   
	console.log(this); 	
	return this.position[0];		
    }            
});


