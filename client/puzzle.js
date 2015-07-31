//Collections

var Puzzles = new Mongo.Collection('allpuzzles');
var Pieces = new Mongo.Collection('allpieces');

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
Template.body.onCreated(function(){
    var that = this;
    this.subscribe('puzzles', function() {
	var puzzle = Puzzles.findOne();
	Session.set('puzzle', puzzle._id);	
	Session.set('scale', growUpto(puzzle, blockify(that.find('.resizer'))));
	$(window).resize(function(event) {
	    Session.set('scale', growUpto(puzzle, blockify(that.find('.resizer'))));
	});
    });
    this.subscribe('pieces');
});

Template.body.helpers({
    puzzle: function() {	
	var puzzle = Puzzles.findOne(Session.get('puzzle'));			
	puzzle.height = puzzle.height * Session.get('scale');
	puzzle.width = puzzle.width * Session.get('scale');
	puzzle.arrangement.height = puzzle.arrangement.height * Session.get('scale');
	puzzle.arrangement.width = puzzle.arrangement.width * Session.get('scale');
	puzzle.arrangement.position = _.map(puzzle.arrangement.position, function (coord) { return coord * Session.get('scale'); });
	return puzzle;
    }
});

//Puzzle
Template.puzzleTemplate.events({
    'mousemove .puzzle': (function() {
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
    }())
});

Template.puzzleTemplate.helpers({    
    pieces: function() {
	var scale = Session.get('scale');
	return Pieces.find({puzzleId: this._id}).map(function(piece, index, cursor){
	    piece.height = piece.height * scale;
	    piece.width = piece.width * scale;
	    piece.position = _.map(piece.position, function (coord, index, array) { return coord * scale; });
	    return piece;
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
    'mousedown .piece': function(event) {
	var pieceId = Session.get('piece');
	if (pieceId != undefined) {
	    Meteor.call('give', pieceId, function(error) {
		if (error) {		
		    Session.set("message", {type: 'error', content: error.reason});
		    return;		    
		}
		Session.set('piece', undefined);	    
	    });    	    	
	} else {
	    Meteor.call('take', event.currentTarget.id, function(error) {
		if (error) {		
		    Session.set("message", {type: 'error', content: error.reason});
		    return;
		}
		Session.set('piece', event.currentTarget.id);
	    });
	}
	event.stopPropagation();
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


