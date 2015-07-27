var Puzzle = new MongoDB.Collection('puzzle');

Meteor.startup(function(){
    
})

//method stubs
Meteor.methods({
    take: function(pieceId) {
	var piece = Puzzle.findOne(pieceId);
	if (piece.ownedBy != undefined) {
	    throw new Meteor.Error("piece-owned", "The piece belongs to someone else!");
	}
	Puzzle.update(pieceId, {$set: {ownerId: this.userId}});	
    },
    move: function(pieceId, deltaX, deltaY) {
	var piece = Puzzle.findOne(pieceId);
	if (piece.ownedBy != this.userId) {
	    throw new Meteor.Error("piece-not-owned", "The piece doesn't belong to you!");
	}	
    },
    give: function(pieceId) {
	var piece = Puzzle.findOne(pieceId);
	if (piece.ownedBy != this.userId) {
	    throw new Meteor.Error("piece-not-owned", "The piece doesn't belong to you!");
	}
	
	Puzzle.update(pieceId, {$set: {ownedBy: undefined}});	
    }
});

//Puzzle
Template.puzzle.events({
    'mousemove': function() {
	var lastX;
	var lastY;
	
	return function(event) {
	    var pieceId = Session.get('piece');
	    if (pieceId) {
		Meteor.call('move', pieceId, event.clientX - lastX, event.clientY - lastY, function(error) {
		    if (error) {
			
			return;
		    }
		    //do nothing
		});
	    }		
	    lastX = event.clientX;
	    lastY = event.clientY;
	}
    }()
});

Template.puzzle.helpers({
    pieces: function(){
	return Puzzle.find({parentId: {$eq: undefined}});
    }
});

//Pieces
Template.piece.events({
    'mousedown .orphan': function(event) {
	event.stopPropagation();
	Meteor.call('take', event.currentTarget.id, function(error) {
	    if (error) {		
		
		return;
	    }
	    Session.set('piece', event.currentTarget.id);
	});    	    
    },
    'mouseup .orphan': function(event) {
	event.stopPropagation();
	Meteor.call('give', event.currentTarget.id, function(error) {
	    if (error) {		
		
		return;
	    }
	    Session.set('piece', undefined);	    
	});    	    	
    }
});

Template.pieces.helpers({    
    childs: function(){
	return Puzzle.find({parentId: {$eq: this._id}});
    },
    height: function(){
	return geoYmax(this.location) - geoYmin(this.location);
    },
    width: function(){
	return geoXmax(this.location) - geoXmin(this.location);
    },
    top: function(){
	return geoYmin(this.location);
    },
    left: function(){
	return geoXmin(this.location);
    },
    condition: function(){
	if (this.parentId == null) {
	    return 'orhpan';
	}
	return return 'adopted';
    },
    orphan: function(){
	return this.parentId == null;
    }
});
