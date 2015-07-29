var Puzzle = new MongoDB.Collection('puzzle');

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
	if (piece.propeties.ownedBy != this.userId) {
	    throw new Meteor.Error("piece-not-owned", "The piece doesn't belong to you!");
	}	
	if (piece.propeties.parentId) {
	    throw new Meteor.Error("piece-adopted", "The piece has been adopted by another!");
	}	
	piece.propeties.ownedBy = undefined;
	var thesebounds = turf.extent(piece);
	var theselinks = piece.properties.links.map(function(link, idx, links){ return transform(link, function(x, y){return [x + thesebounds[0][0], y + + thesebounds[0][1]]; })}; });        
	// any overlapped pieces?
        var others = Puzzle.find({$where: function() { 
	    return this.properties.parentId == undefined && 
		this.properties.links.find(function(link, idx, links) { return link.properties.tag == pieceId; }) != undefined;
	}});
        for (var i = 0; i < others.length ; i++) {
	    

	}
	    // any overlapped links?
	    var thosebounds = turf.extent(other.location);
	    var thoselinks = other.links.map(function(link, idx, links) { return transform(link, function(x, y){return [x + thosebounds[0][0], y + + thosebounds[0][1]]; }); }); });
            var matchlink = thoselinks.find(function(link, idx, links) { return link.tag == turf.intersect(piece, link); }); 
            theselinks.map(function())
             var linkpair = matchOne(thoselinks, thislinks, function(a, b) { return a.type == b.type && turf.intersect(a.location, b.location) != undefined; });
    
		var thoselb = geobounds(linkpair[0].location);		
		var theselb = geobounds(linkpair[1].location);
		var deltax = thoselb[0][0] - theselb[0][0];
		var deltay = thoselb[0][1] - theselb[0][1];
		piece.location = geotransform(piece.location, function (x, y) { return [x+deltax, y+deltay]; });		
		piece.parentId = ;
		
		
	    
	});	
	Puzzle.update(pieceId, piece);		
    }
});

Meteor.startup(function () {
    
});
