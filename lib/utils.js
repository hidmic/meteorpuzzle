function blockify(domElem) {
    var rect = domElem.getBoundingClientRect();
    return {position: [rect.left, rect.top], height: domElem.clientHeight, width: domElem.clientWidth};
}

function intersects(block1, block2, tolerance) {
    return !((block1.position[0]+block1.width+tolerance<block2.position[0] || 
	       block2.position[0]+block2.width+tolerance<block1.position[0] ||
	       block1.position[1]+block1.height+tolerance<block2.position[1] || 
	       block2.position[1]+block2.height+tolerance<block1.position[1]));
}

function growUpto(innerBlock, outerBlock) {
    var wscale = outerBlock.width / innerBlock.width;
    var hscale = outerBlock.height / innerBlock.height;
    if (hscale > wscale) {
	return wscale;
    }
    return hscale;
}

