/* @file msaifront.js
 * @author Louis Jacobowitz
 *
 * Description:
 ** Front-facing AI routines. Mostly functional in nature, calling more
 **   procedural routines declared in msaicore.js
 * 
 * Prerequisites:
 ** > mssetup.js - Will fail on uninitialized board
 *
 * Dependencies: 
 ** > msaicore.js - Contains core functionality
 ** > msbase.js - declares constants, data types, global variables
 */

// Choose a move for the AI (that is, generates a possible tile that could be affected).
// Returns a 2-element array. The first element is the array of safe tiles, and
// the second element is the array of flaggable tiles.
function AIGetMove() {
	// Get our lists of tiles
	var unrevealedTiles = findUsefulUnrevealedTiles();
	var revealedTiles = findUsefulRevealedTiles();
	// Generate the matrices we'll need to find flaggable tiles
	var solVector = getSolVector( revealedTiles );
	var mulVector = getMulVector( revealedTiles, unrevealedTiles );
	// Now, we can simply make an augmented matrix and then do Gaussian elimination.
	var A = mulVector;
	for ( var i = 0; i < solVector.length; i++ ) {
		A[i].push( solVector[i] );
	}
	// First, scan this matrix to find if there's any tiles we can clear
	var safeTiles = getSafeTiles( A, revealedTiles );
	// Then, do Guass on it
	var s = gauss( A );
	// Then, we use the generated matrix to find flaggable tiles.
	var flaggableTiles = getFlaggableTiles( s, unrevealedTiles );

	// If the cheap way didn't work, use the expensive way.
	if ( flaggableTiles.length == 0 && safeTiles.length == 0 ) {
		var s = findTank( revealedTiles );
		flaggableTiles = s[1];
		safeTiles = s[0];
	}

	// Return these. 
	return [ safeTiles, flaggableTiles ];
}

// Assesses all tiles on the board, and assigns probabilities of being a non-mine to each of them. 
// Returns the moves with the lowest probability of being a mine, and that probability, in 
//   a 2-element array
function AIGetMostProbableMoves() {
	// First, construct a revealedTiles array
	var revealedTiles = findUsefulRevealedTiles();
	// Then, get the aggregate array
	var aggregateArray = aggregateSolutions( revealedTiles );
	// Use the aggregate array to find probability array
	var probArray = getProbabilityFromAggregate( aggregateArray );

	// Now, try to find the lowest probability, and the tiles with said lowest probability.
	var lowestProb = 1;
	var lowestTiles = [];
	for ( var i = 0; i < height; i++ ) {
		for ( var j = 0; j < width; j++ ) {
			if ( probArray[i][j] < lowestProb ) {
				lowestProb = probArray[i][j];
				lowestTiles = [ board[i][j] ];
			}
			else if ( probArray[i][j] == lowestProb ) {
				lowestTiles.push( board[i][j] );
			}
		}
	}

	// Return a 2-element array. First element is the tiles. Second element is the probability.
	return [ lowestTiles, lowestProb ];
}

// Calls AIGetMove, and then uses its return value to actually modify the board.
function AIChooseMove() {
	if ( gameOver ) { return; }

	document.getElementById( "aiButton" ).innerHTML = "AI is thinking...";
	var gm = AIGetMove();
	var flaggableTiles = gm[ 1 ];
	var safeTiles = gm[ 0 ];

	// What if there's no guarantees? Then we must guess.
	if ( flaggableTiles.length == 0 && safeTiles.length == 0 ) {
		// Choose a random one of the most probable moves.
		var probableTiles = AIGetMostProbableMoves();
		var c = Math.floor( Math.random() * probableTiles[0].length );
		safeTiles.push( probableTiles[0][c] );
	}

	// interact with the board
	for ( var i = 0; i < flaggableTiles.length; i++ ) {
		if ( !flaggableTiles[i].flagged ) {
			console.log( "Flagging tile (" + flaggableTiles[i].x + ", " + flaggableTiles[i].y + ")" );
			tileFlagged( flaggableTiles[i].x, flaggableTiles[i].y, flaggableTiles[i].obj );
		}
	}
	for ( var i = 0; i < safeTiles.length; i++ ) {
		console.log( "Revealing tile (" + safeTiles[i].x + ", " + safeTiles[i].y + ")" );
		tileClicked( safeTiles[i].x, safeTiles[i].y, safeTiles[i].obj );
	}

	document.getElementById( "aiButton" ).innerHTML = "Let the AI choose";

	// Return a combination of both of these; no need to discriminate which
	return [ safeTiles, flaggableTiles ];
}
