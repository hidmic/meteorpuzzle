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
    ready: function() {
	var subscriptionsReady = PuzzleSubscription.ready() && PieceSubscription.ready();
	if (subscriptionsReady) {
	    var puzzle = Puzzles.findOne();
	    var container = Template.body.find('.container');
	    Session.set('puzzle', puzzle._id);
	    Session.set('scale', Math.sqrt((container.clientWidth * container.clientHeight)/(puzzle.height * puzzle.width)));
	}
	return subscriptionsReady;
    },
    puzzle: function() {	
	var puzzle = Puzzles.findOne(Session.get('puzzle'));			
	puzzle.height = puzzle.height * Session.get('scale');
	puzzle.width = puzzle.width * Session.get('scale');
	puzzle.arrangement.height = puzzle.arrangement.height * Session.get('scale');
	puzzle.arrangement.width = puzzle.arrangement.width * Session.get('scale');
	puzzle.arrangement.position = _.map(puzzle.arrangement.position, function (coord) { return coord * Session.get('scale'); });
	console.log(puzzle);
	return puzzle;
    }
});

Template.body.events({
    'resize': function(event) {
	var puzzle = Puzzles.findOne(Session.get('puzzle'));
	var container = Template.body.find('.container');
	Session.set('scale', Math.sqrt((container.clientWidth * container.clientHeight)/(puzzle.height * puzzle.width)));
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
		var deltaX = (event.clientX - lastX) / Session.get('scale');
		var deltaY = (event.clientY - lastY) / Session.get('scale');
		Meteor.call('move', pieceId, deltaX, deltaY, function(error) {
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
	return Pieces.find({puzzleId: this._id}).map(function(piece){
	    piece.height = piece.height * Session.get('scale');
	    piece.width = piece.width * Session.get('scale');
	    piece.position = _.map(piece.position, function (coord) { return coord * Session.get('scale'); });
	});
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
    	return this.position[1];
    },
    left: function() {   
	return this.position[0];		
    }            
});


