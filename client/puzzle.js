Meteor.startup(function(){

    Session.set('piece')
})

Template.puzzle.onCreated(function(){
    this.subscribe("boundPieces");
    this.subscribe("unboundPieces");
});

Template.puzzle.events({
    'mousedown .unbound-piece': function (e) {
	e.stopPropagation();
	Meteor.call('takePiece', this.id, function(error) {
	    if (error) {		
		
		return;
	    }
	    Session.set('piece', {pieceId: this.id, pointerX: , pointerY: });	    
	});    
    },
    'mouseup .unbound-piece': function(e) {		
	if ()
	Meteor.call('givePiece', this.id, function(error) {
	    if (error) {
		
		return;
	    }
	    
	});
    },
    
    'mousemove': function(e) {
	var piece = Session.get('piece');
	if (piece != undefined) {
	    
	    Meteor.call('movePiece', function(error, result) {
		if (error) {
		
		    return;
		}
		
	    });	    
	}
    }
});

Template.puzzle.helpers({
    xformCoord: function(){
	
    }
});

