var Puzzle
var Pieces = new MongoDB.Collection('allpieces');

Meteor.publish('pieces', function() {
	return Puzzle.find({}, {trueLoc: 0});
});

Meteor.methods({
    take: function(pieceId) {
		var piece = Pieces.findOne(pieceId);
		if (piece.ownedBy != undefined) {
		    throw new Meteor.Error("piece-owned", "The piece belongs to someone else!");
		}		
		if (piece.inLock) {
			throw new Meteor.Error("piece-locked", "The piece is already in its place!");			
		}
		piece.ownedBy = this.userId;
		Puzzle.update(pieceId, piece);	
    },
    move: function(pieceId, deltaX, deltaY) {
		var piece = Pieces.findOne(pieceId);
		if (piece.ownedBy != this.userId) {
		    throw new Meteor.Error("piece-not-owned", "The piece doesn't belong to you!");
		}		
		piece.currPos = [piece.currPos[0] + deltaX, piece.currPos[1] + deltaY];
		Puzzle.update(pieceId, piece);	
    },
    give: function(pieceId) {
		var piece = Pieces.findOne(pieceId);
		if (piece.ownedBy != this.userId) {
		    throw new Meteor.Error("piece-not-owned", "The piece doesn't belong to you!");
		}		
		piece.ownedBy = undefined;
		//Is 'piece' within its true location boundaries?
		if (!((piece.truePos[0]+piece.width<piece.currPos[0] || 
			piece.currPos[0]+piece.width<piece.truePos[0] ||
			piece.truePos[0]+piece.height<piece.currPos[1] || 
			piece.currPos[1]+piece.height<piece.truePos[1]))) 
		{
			piece.currLoc = piece.trueLoc;
			piece.inLock = true;			
		}		
		Pieces.update(pieceId, piece);		
    }
});

Meteor.startup(function () {
	var puzzle = EJSON.parse(Assets.getText('wall-e.json'));
    _.each(puzzle, function(piece) {
    	 = puzzle.arrangement.height
    	puzzle.arrangement.size
    	 = Random.fraction();
    	
    	piece.currPos = []
    	Puzzle.insert(piece);
    });    
});

{
	name:
	height:
	width:
	arrangement:
	pieces:	
}