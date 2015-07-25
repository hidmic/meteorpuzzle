Puzzle = new MongoDB.Collection('puzzle');

Meteor.publish("boundPieces", function() {   
    return Puzzle.find({bounded: {$eq true}});
});

Meteor.publish("unboundPieces", function() {
    this._session.socket.on("close", function(){
	Puzzle.update({ownedBy: {$eq this.userId}}, {$set: {ownedBy: null}});
    });
    return Puzzle.find({bounded: {$eq false}});
});

Meteor.methods({
    takePiece: function(pieceId) {
	var piece = Puzzle.findOne(pieceId);
	if (piece.ownedBy != undefined) {
	    throw new Meteor.Error("piece-owned", "The piece belongs to someone else!");
	}
	Puzzle.update(pieceId, {$set: {ownedBy: this.userId}});	
    },
    movePiece: function(pieceId, deltaX, deltaY) {
	var piece = Puzzle.findOne(pieceId);
	if (piece.ownedBy != this.userId) {
	    throw new Meteor.Error("piece-not-owned", "The piece doesn't belong to you!");
	}
	
    },
    givePiece: function(pieceId) {
	var piece = Puzzle.findOne(pieceId);
	if (piece.ownedBy != this.userId) {
	    throw new Meteor.Error("piece-not-owned", "The piece doesn't belong to you!");
	}
	
	Puzzle.update(pieceId, {$set: {ownedBy: undefined}});	
    },
    resetPieces: function() {

    }
});

Meteor.startup(function () {
    var pieceLocations = EJSON.parse(Assets.getText('wall_e'));
    for(piece in pieceLocations) {
	Puzzle.insert({
	    ownedBy: undefined,
	    bounded: false,
	    currLoc: [-1, -1, -1, -1],
	    trueLoc: pieceLocations[piece],
	    imageUrl: 'wall_e/'+piece,
	});
    }	
});
