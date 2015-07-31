# meteorpuzzle
MeteorJS-based puzzle

Very simplified puzzle using MeteorJs, using methods for securing concurrent access to pieces. It also scales to current 
window size. Needs proper styling though, I've got no aesthetic skills.

Neither framework nor task were too difficult. But during initial design steps, I went for an arrangement-less puzzle, 
where each piece exposed a number of 'links', tagged, in order to detect a neighbour piece. I went for a GeoJSON 
representation for those links and the pieces (as it's supported by MongoDB). As you might think, complexity sky-rocketed.
I realize I couldn't build it fast enough to meet my deadline. So I had to make things simpler.



