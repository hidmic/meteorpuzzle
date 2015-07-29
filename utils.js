function transform(geo, xform) {
    return {
	type: geo.type,
	properties: geo.properties,
	geometry: {
	    type: geo.geometry.type,
	    coordinates: geo.geometry.coordinates[0].map(xform)
	}	
    };    
}

