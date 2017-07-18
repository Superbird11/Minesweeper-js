/* @file mscheck.js
 * @author Louis Jacobowitz
 *
 * Description:
 ** This file contains methods that examine the board broadly and accommodate moves made
 **   by the user, by altering the board in-place. 
 *
 * Prerequisites:
 ** > msaction.js - required to call these functions
 *
 * Dependencies:
 ** > msbase.js - defints constants and the tile datatype
 ** > msutils.js - for using functions to retrieve adjacent and relative lists of tiles
 **     that fulfill certain criteria
 ** > msai.js - Used for subroutines to generate copies of the board (so as not to disrupt it
 **     until doing so becomes necessary)
 ** > msboard.js - for cleaning up the mine counts after each successful swap
 */

// Checks each revealed tile on the board and verifies that it has exactly
// as many surrounding mines as it thinks it has. If this is not the case, 
// returns a list of unflagged mines surrounding the tile; if it is the case,
// returns null instead.
function verifyBoard( mbrd ) {
	if ( !mbrd ) { mbrd = board; }
	for ( var i = 0; i < height; i++ ) {
		for ( var j = 0; j < width; j++ ) {
			if ( !mbrd[i][j].revealed ) { continue; }
			var sm = mbrd[i][j].surroundingMines;
			var gac = getAdjacentCondition( i, j, function(a,b){return mbrd[a][b].isMine;}, mbrd).length;
			if ( mbrd[i][j].surroundingMines == getAdjacentCondition( i, j, 
				function(a,b){return mbrd[a][b].isMine;}, mbrd ).length ) { 
				continue; }
			// if something still is out of place, call reshuff
			return mbrd[i][j];
		}
	}
	return null;
}

// Takes the tile the user just clicked on, makes it no longer a mine.
// A random blank tile that isn't currently a mine, is now a mine. 
// If there are no blank tiles, do brute reshuffle.
// This creates a discrepancy in the immediate area. 
// In a 3-radius square (7x7 around the clicked mine: First, find out
//   how many mines there are, and then construct a fake board, and
//   brute-force solutions for it.
// Put in the new brute-force solution, and take the difference in mines
//   out of blank tiles. If this cannot be done, do brute reshuffle.
function reshuffle( x1, y1 ) {
	var searchDimension = 3;
	var largerDimension = width;
	if ( height > width ) { largerDimension = height; }

	if ( withinRangeCondition( x1, y1, largerDimension, 
		function(a,b){return !board[a][b].revealed && !board[a][b].flagged;} ).length <= 10 ) {
		bruteReshuffle( x1, y1 );
		return;
	}

	// First, get a deep copy of the board.
	var boardCopy = getBoardCopy( x1, y1, largerDimension, true )[0];
	// We will work from this deep copy exclusively, and copy over at the end of the process.

	// Declare a mine differential: The number of mines we need to "put back" into blank spaces.
	var mineDiff = 0;

	// Make the clicked tile not a mine.
	if ( boardCopy[x1][y1].isMine ) {
		mineDiff++;
	}
	boardCopy[x1][y1].isMine = false;

	// Make lists of revealed, unrevealed tiles
	var revealedTiles = withinRangeCondition( x1, y1, largerDimension, 
		function(a,b){return boardCopy[a][b].revealed && numAdjacentUnrevealed(a,b) > 0;}, boardCopy );
	var unrevealedTiles = withinRangeCondition( x1, y1, largerDimension,
		function(a,b){return !boardCopy[a][b].revealed && !boardCopy[a][b].flagged && numAdjacentRevealed(a,b) > 0;},
		boardCopy );
	var unrevealedMineTiles = withinRangeCondition( x1, y1, largerDimension,
		function(a,b){return (!boardCopy[a][b].revealed && !boardCopy[a][b].flagged && boardCopy[a][b].isMine && 
			(numAdjacentRevealed(a,b) > 0));}, boardCopy );
	var unrevealedSafeTiles = withinRangeCondition( x1, y1, largerDimension,
		function(a,b){return (!boardCopy[a][b].revealed && !boardCopy[a][b].flagged && !boardCopy[a][b].isMine &&
			(numAdjacentRevealed(a,b) > 0));}, boardCopy );

	// Look for discrepancies
	// First, get an iteration max.
	var iterationMax = unrevealedTiles.length * 10; 
	// Initialize the mine count.
	do {
		var wrong = null;
		var expected, observed;
		// Find the first tile that's out of place, if one exists
		for ( var i = 0; i < revealedTiles.length; i++ ) {
			expected = revealedTiles[i].surroundingMines;
			var observedArr = getAdjacentCondition( revealedTiles[i].x, revealedTiles[i].y, 
				function(a,b){return boardCopy[a][b].isMine || boardCopy[a][b].flagged;}, boardCopy );
			observed = observedArr.length;
			if ( expected != observed ) {
				wrong = revealedTiles[i];
				break;
			}
		}
		if ( !wrong ) {
			break;
		}
		// Act oppositely based on whether we need to add or remove a mine. 
		if ( expected > observed ) {
			// we need to add in a mine.
			// First, fetch tiles we can do this to
			var toBeMines = [];
			var nAdj = 1;
			while ( toBeMines.length == 0 && nAdj < 8) {
				// Look for tiles with as few adjacent revealed tiles as possible. 
				// This way, we will have to make the least number of changes.
				toBeMines = getAdjacentCondition( wrong.x, wrong.y,
					function(a,b){return unrevealedSafeTiles.indexOf(boardCopy[a][b]) >= 0 &&
						getAdjacentRevealed(a,b).length == nAdj;}, boardCopy );
				nAdj++;
			}
			if ( toBeMines.length == 0 ) {
				return; // no replacement found, impossible action
			}
			// Choose one such tile, make it a mine
			var c = Math.floor( Math.random() * toBeMines.length );
			toBeMines[c].isMine = true;
			mineDiff--;
			// Remove it from unrevealedTiles and unrevealedMineTiles.
			// We don't want to go in circles. 
			var ustIdx = unrevealedSafeTiles.indexOf( toBeMines[c] );
			if ( ustIdx >= 0 ) { unrevealedSafeTiles.splice( ustIdx, 1 ); }
			// Actually, don't. Let's test whether it actually does go in circles.
			// ustIdx = unrevealedTiles.indexOf( toBeMines[c] );
			// if ( ustIdx >= 0 ) { unrevealedTiles.splice( ustIdx, 1 ); }
			//unrevealedMineTiles.push( toBeMines[c] );
		} else {
			// we need to remove a mine.
			// First, fetch tiles we can do this to
			var toBeSafe = [];
			var nAdj = 1;
			while ( toBeSafe.length == 0 && nAdj < 8 ) {
				toBeSafe = getAdjacentCondition( wrong.x, wrong.y,
					function(a,b){return unrevealedMineTiles.indexOf(boardCopy[a][b]) >= 0 &&
						getAdjacentRevealed(a,b).length == nAdj;}, boardCopy );
				nAdj++;
			}
			if ( toBeSafe.length == 0 ) {
				return; 
			}
			// Choose one such tile, make it a mine
			var c = Math.floor( Math.random() * toBeSafe.length );
			toBeSafe[c].isMine = false;
			mineDiff++;
			// Remove it from unrevealedTiles and unrevealedMineTiles.
			// We don't want to go in circles. 
			var ustIdx = unrevealedMineTiles.indexOf( toBeSafe[c] );
			if ( ustIdx >= 0 ) { unrevealedMineTiles.splice( ustIdx, 1 ); }
			//// Actually, don't. Let's test whether it actually does go in circles.
			//ustIdx = unrevealedTiles.indexOf( toBeMines[c] );
			//if ( ustIdx >= 0 ) { unrevealedTiles.splice( ustIdx, 1 ); }
			//unrevealedSafeTiles.push( toBeSafe[c] );
		}
	} while ( (iterationMax--) > 0 );

	// If iterationMax is less than or equal to 0, we failed to find a good move, so return.
	if ( iterationMax <= 0 ) {
		return;
	}

	// Balance out mineDiff with safe tiles
	if ( mineDiff > 0 ) {
		// We have to add mines 
		var blankSafeTiles = withinRangeCondition( x1, y1, largerDimension,
			function(a,b){return (!boardCopy[a][b].revealed && !boardCopy[a][b].flagged && 
				!boardCopy[a][b].isMine && (numAdjacentRevealed(a,b) == 0));}, boardCopy );
		if ( blankSafeTiles.length < mineDiff ) {
			// Then a very serious mistake was made somewhere. This is not a valid substitution.
			return;
		}
		for ( var i = 0; i < mineDiff; i++ ) {
			var c = Math.floor( Math.random() * blankSafeTiles.length );
			blankSafeTiles[c].isMine = true;
			blankSafeTiles.splice( c, 1 );
		}
	}
	else if ( mineDiff < 0 ) {
		// We have to remove mines
		var blankMineTiles = withinRangeCondition( x1, y1, largerDimension,
			function(a,b){return (!boardCopy[a][b].revealed && !boardCopy[a][b].flagged && 
				boardCopy[a][b].isMine && (numAdjacentRevealed(a,b) == 0));}, boardCopy );
		if ( blankMineTiles.length < ( mineDiff * -1 ) ) {
			// Then we messed up and assigned too many mines. The user should have been
			// able to figure it out.
			return;
		}
		for ( var i = 0; i > mineDiff; i-- ) {
			var c = Math.floor( Math.random() * blankMineTiles.length );
			blankMineTiles[c].isMine = false;
			blankMineTiles.splice( c, 1 );
		}
	}

	// Otherwise, copy over fake board to real board.
	for ( var i = 0; i < height; i++ ) {
		for ( var j = 0; j < width; j++ ) {
			if ( board[i][j].isMine != boardCopy[i][j].isMine ) {
				board[i][j].isMine = boardCopy[i][j].isMine;
			}
		}
	}
	setSurroundingMines();
	return;
}

// Finds combinations of mines by brute-forcing every available place to put mines
// on the board at present. See reshuffle().
// This function is called when Reshuffle can't handle the board, or when the board
// is small enough for it to be reasonably fast.
function bruteReshuffle( x1, y1 ) {
	boardSize = height;
	if ( width > height ) { boardSize = width; }
	// First, get a copy of the board, including blanks
	var fakeBoard = getBoardCopy( x1, y1, boardSize, false, false )[0];
	// Get correct configurations
	var sol = getCorrectConfigurations( fakeBoard, x1, y1 );
	// Get a list of corresponding real tiles to the nulls.
	// Verify which one is (x1, y1).
	var realTileIdx = null;
	var correspondingTiles = [];
	for ( var i = 0; i < height; i++ ) {
		for ( var j = 0; j < width; j++ ) {
			if ( !fakeBoard[i][j] ) {
				correspondingTiles.push( board[i][j] );
				if ( i == x1 && j == y1 ) {
					realTileIdx = correspondingTiles.length - 1;
				}
			}
		}
	}
	// Run through all correct configurations, discard those that mark (x1, y1)
	for ( var i = 0; i < sol.length; i++ ) {
		var ct = minesLeft;
		for ( var j = 0; j < sol[i].length; j++ ) {
			ct -= sol[i][j];
		}
		if ( ct != 0 || sol[i][realTileIdx] == 1 ) {
			sol.splice( i, 1 );
			i--;
		}
	}
	// If there are no remaining configurations, user must have made a mistake that
	// the solver didn't catch, i guess
	if ( sol.length == 0 ) { return; }
	// Otherwise, randomly choose one solution and apply it.
	var chosen = sol[ Math.floor( Math.random() * sol.length ) ];
	for ( var i = 0; i < chosen.length; i++ ) {
		if ( chosen[i] == 0 ) {
			correspondingTiles[i].isMine = false;
		}
		else {
			correspondingTiles[i].isMine = true;
		}
	}
	// Finally, obligatory update counts
	var verified = verifyBoard();
	setSurroundingMines();
	return;
}
