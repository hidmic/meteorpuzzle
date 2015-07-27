var Puzzle = new MongoDB.Collection('puzzle');

Meteor.methods({
    take: function(pieceId) {
	var piece = Puzzle.findOne(pieceId);
	if (piece.ownedBy) {
	    throw new Meteor.Error("piece-owned", "The piece belongs to someone else!");
	}
	if (piece.parentId) {
	    throw new Meteor.Error("piece-adopted", "The piece has been adopted by another!");
	}
	Puzzle.update(pieceId, {$set: {ownedBy: this.userId}});	
    },
    move: function(pieceId, deltaX, deltaY) {
	var piece = Puzzle.findOne(pieceId);
	if (piece.ownedBy != this.userId) {
	    throw new Meteor.Error("piece-not-owned", "The piece doesn't belong to you!");
	}
	if (piece.parentId) {
	    throw new Meteor.Error("piece-adopted", "The piece has been adopted by another!");
	}
	var newLocation = geotransform(piece.location, function(x, y) { return [x+deltaX, y+deltaY]; });
	Puzzle.update(pieceId, {$set: {location: newLocation}})	
    },
    give: function(pieceId) {
	var piece = Puzzle.findOne(pieceId);
	if (piece.ownedBy != this.userId) {
	    throw new Meteor.Error("piece-not-owned", "The piece doesn't belong to you!");
	}	
	if (piece.parentId) {
	    throw new Meteor.Error("piece-adopted", "The piece has been adopted by another!");
	}	
	piece.ownedBy = undefined;
	var theselinks = piece.links.map(function(link){ return {type: link.type, location: geotransform(link.location, piece.location)}; })
	// any overlapped pieces?
        Puzzle.find({_id: {$ne: pieceId}, parentId: {$eq: undefined}, location: {$geoIntersects: piece.location}}).forEach(function(other) {
	    // any overlapped links?
	    var thoselinks = other.links.map(function(link){ return {type: link.type, location: geotransform(link.location, other.location)}; })
	    var pair = matchOne(thoselinks, thislinks, function(a, b) { return a.type == b.type && geointersects(a.location, b.location); });
	    if (pair) {
		var delta = geodelta(pair[0], pair[1]);
		piece.location = geotransform(piece.location, function (x, y) { return [x+delta[0], y+delta[1]]; });
		
		piece.parentId = other._id;
	    }
	});	
	Puzzle.update(pieceId, piece);		
    }
});

Meteor.startup(function () {
    
});
