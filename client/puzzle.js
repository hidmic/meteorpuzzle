var Puzzle = new MongoDB.Collection('puzzle');

Meteor.startup(function(){
    
})

//method stubs
Meteor.methods({
    take: function(pieceId) {
	var piece = Puzzle.findOne(pieceId);
	if (piece.properties.ownedBy) {
	    throw new Meteor.Error("piece-owned", "The piece belongs to someone else!");
	}
	if (piece.properties.parentId) {
	    throw new Meteor.Error("piece-adopted", "The piece has been adopted by another!");
	}
	piece.propeties.ownedBy = this.userId;
	Puzzle.update(pieceId, piece);	
    },
    move: function(pieceId, deltaX, deltaY) {
	var piece = Puzzle.findOne(pieceId);
	if (piece.properties.ownedBy != this.userId) {
	    throw new Meteor.Error("piece-not-owned", "The piece doesn't belong to you!");
	}
	if (piece.propeties.parentId) {
	    throw new Meteor.Error("piece-adopted", "The piece has been adopted by another!");
	}
	piece = transform(piece, function(x, y) { return [x+deltaX, y+deltaY]; });
	Puzzle.update(pieceId, piece);	
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
	
	if (Session.get('piece') != undefined) {
	    Meteor.call('give', event.currentTarget.id, function(error) {
		if (error) {		
		    
		    return;
		}
		Session.set('piece', undefined);	    
	    });    	    	
	}
    }
});

Template.pieces.helpers({    
    childs: function(){
	return Puzzle.find({parentId: {$eq: this._id}});
    },
    height: function(){
	var bounds = geobounds(this.location);
	return bounds[1][1] - bounds[0][1];
    },
    width: function(){
	var bounds = geobounds(this.location);
	return bounds[1][0] - bounds[0][0];
    },
    top: function(){
	return geobounds(this.location)[0][1];
    },
    left: function(){
	return geobounds(this.location)[0][0];
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
