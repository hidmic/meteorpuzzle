//Collections
var Puzzles = new Mongo.Collection('allpuzzles');
var Pieces = new Mongo.Collection('allpieces');

//Publications
Meteor.publish('puzzles', function() {
    return Puzzles.find();
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
	Pieces.update(pieceId, piece);	
    },
    move: function(pieceId, deltaX, deltaY) {
	var piece = Pieces.findOne(pieceId);
	if (piece.ownedBy != this.userId) {
	    throw new Meteor.Error("piece-not-owned", "The piece doesn't belong to you!");
	}		
	piece.position = [piece.position[0] + deltaX, piece.position[1] + deltaY];
	Pieces.update(pieceId, piece);	
    },
    give: function(pieceId) {
	var piece = Pieces.findOne(pieceId);
	if (piece.ownedBy != this.userId) {
	    throw new Meteor.Error("piece-not-owned", "The piece doesn't belong to you!");
	}		
	piece.ownedBy = undefined;
	//Is 'piece' within its true location boundaries?	
	if (!((piece.truePosition[0]+piece.width<piece.position[0] || 
	       piece.position[0]+piece.width<piece.truePosition[0] ||
	       piece.truePosition[1]+piece.height<piece.position[1] || 
	       piece.position[1]+piece.height<piece.truePosition[1]))) 
	{
	    piece.position = piece.truePosition;
	    piece.inLock = true;			
	}		
	Pieces.update(pieceId, piece);		
    },
    reset: function(puzzleId) {
	var puzzle = Puzzles.findOne(puzzleId);
	Pieces.find({puzzleId: {$eq: puzzleId}}).forEach(function(piece) {
	    piece.inLock = false;
	    do {
		var deltaX = piece.width * (2 * Random.fraction() - 1)
		var deltaY = piece.height * (2 * Random.fraction() - 1);
		var newX = piece.position[0] + deltaX;
		var newY = piece.position[1] + deltaY;
		if (newX < 0) newX = puzzle.width + newX;
		if (newX + piece.width > puzzle.width) newX = newX + piece.width - puzzle.width;
		if (newY < 0) newY = puzzle.height + newY;
		if (newY + piece.height > puzzle.height) newY = newY + piece.height - puzzle.height;
		piece.position = [newX, newY];
	    } while(intersects(piece, puzzle.arrangement));
	    Pieces.update(piece._id, piece);
	});
    }
});

function intersects(e1, e2) {
    return !((e1.position[0]+e1.width<e2.position[0] || 
	       e2.position[0]+e2.width<e1.position[0] ||
	       e1.position[1]+e1.height<e2.position[1] || 
	       e2.position[1]+e2.height<e1.position[1]));
}

Meteor.startup(function () {
    if (Puzzles.find().count() === 0) {
	var puzzle = EJSON.parse(Assets.getText('wall-e.json'));           
	var id = Puzzles.insert({
	    name: puzzle.name, 
	    height: puzzle.arrangement.height * 2, // As it must be at least 1.41 times larger in order to have its pieces around
	    width: puzzle.arrangement.width * 2,  // As it must be at least 1.41 times larger in order to have its pieces around
	    arrangement: {
		position: [
		    puzzle.arrangement.width/2, 
		    puzzle.arrangement.height/2
		],
		width: puzzle.arrangement.width,
		height: puzzle.arrangement.height,
		imageUrl: puzzle.arrangement.imageUrl
	    }
	});    
	_.each(puzzle.pieces, function(piece) {	    
	    Pieces.insert({
		puzzleId: id,
		imageUrl: piece.imageUrl,
		truePosition: [
		    piece.position[0] + puzzle.arrangement.width/2,
		    piece.position[1] + puzzle.arrangement.height/2
		],
		position: [
		    puzzle.arrangement.width,
		    puzzle.arrangement.height
		],
		height: piece.height,
		width: piece.width,
		ownedBy: undefined,
		inLock: false
	    });
	});
	Meteor.call('reset', id);
    }
});
