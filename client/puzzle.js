//Collections

Meteor.subscribe('puzzles');

var Puzzles = new MongoDB.Collection('allpuzzles');

Meteor.subscribe('pieces');

var Pieces = new MongoDB.Collection('allpieces');

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

//Bpdy
Template.body.helpers({
    puzzle: function() {
	return Puzzles.findOne({name: {$eq: Session.get('puzzle')}});
    }
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

Template.puzzle.helpers({
    pieces: function(){
	return Pieces.find({puzzleId: {$eq: Session.get('puzzle')}});
    },
    message: function() {
	return Session.get('message');
    }
});

//Arrangement
Template.arrangement.helpers({
   left: function(){
       return this.position[0];
   },
   top: function(){
       return this.position[1];
   }  
});

//Pieces
Template.piece.events({
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

Template.pieces.helpers({           
    top: function() {
    	return this.position[1];
    },
    left: function() {    	
	return this.position[0];		
    }            
});

Meteor.startup(function(){
    var onePuzzle = Puzzle.findOne({});
    Session.set('puzzle', onePuzzle._id);
});


