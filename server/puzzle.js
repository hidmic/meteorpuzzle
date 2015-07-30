//Collections
var Puzzles = new MongoDB.Collection('allpuzzles');
var Pieces = new MongoDB.Collection('allpieces');

//Publications
Meteor.publish('puzzles', function() {
    return Puzzles.find({});
});

Meteor.publish('pieces', function() {
    return Pieces.find({}, {truePosition: 0})
});

//Methods
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
	Pieces.update(pieceId, piece);	
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
    },
    reset: function(puzzleId) {
	Pieces.find({puzzleId; {$eq: puzzleId}}).forEach(function(piece) {
	    
	});
    }
});

Meteor.startup(function () {
    var puzzle = EJSON.parse(Assets.getText('wall-e.json'));           
    var xpuzzle = {
	name: puzzle.name, 
	height: puzzle.arrangement.height * 2, // As it must be at least 1.41 times larger in order to have its pieces around
	width: puzzle.arrangement.width * 2,  // As it must be at least 1.41 times larger in order to have its pieces around
	arrangement: {
	    position: [
		puzzle.arrangement.position[0] + puzzle.arrangement.width/2, 
		puzzle.arrangement.position[1] + puzzle.arrangement.height/2
	    ],
	    width: puzzle.arrangement.width,
	    height: puzzle.arrangement.height,
	    imageUrl: puzzle.arrangement.imageUrl
	}
    };
    Puzzles.insert(xpuzzle);    
    _.each(puzzle.pieces, function(piece) {	    
	var xpiece = {
	    puzzleId: xpuzzle._id
	    imageUrl: piece.imageUrl,
	    truePosition: [
		piece.position[0] + xpuzzle.arrangement.position[0],
		piece.position[1] + xpuzzle.arrangement.position[1]
	    ],
	    currPosition: [0, 0],
	    height: piece.height,
	    width: piece.width,
	    ownedBy: undefined,
	    inLock: false
	};
	Pieces.insert(xpiece);
    });
    Meteor.call('reset', xpuzzle._id);
});
