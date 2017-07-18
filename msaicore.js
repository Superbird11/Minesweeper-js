/* @file msaicore.js
 * @author Louis Jacobowitz
 *
 * Description
 ** Contains the core methods of the AI subroutine. There are a lot of layers here, and the
 **   code is unfortunately quite opaque and difficult to elegantly divide,
 **   so it shall stay in one file.
 *
 * Prerequisites:
 ** > mssetup.js - these routines will crash on an uninitialized board
 ** > msaifront.js - Calls these functions on behalf of functioning AI
 *
 * Dependencies:
 ** > msbase.js - defines data structures and constants
 ** > msutils.js - for getting collections of tiles meeting certain criteria,
 **     aclose to known tiles.
 ** > mscopy.js - for getting a copy of the board (thus not disturbing the real one)
 */

// Solve a linear system of equations given by a n times
//   n matrix with a result vector n times 1.
// ref: https://martin-thoma.com/solving-linear-equations-with-gaussian-elimination/
function gauss( B ) {
	// n => totalColumns
	var totalColumns = B[0].length;
	// m => totalRows
	var totalRows = B.length;

	// Make a shallow copy
	var A = [];
	for ( var i = 0; i < totalRows; i++ ) {
		A.push([]);
		for ( var j = 0; j < totalColumns; j++ ) {
			A[i].push( B[i][j] );
		}
	}

	// i => row
	var row = 0;
	// j => col
	var col = 0;
	while ( ( row < totalRows ) && ( col < totalColumns ) ) {
		var max_row = row;
		// k => currentRow
		for ( var currentRow = row + 1; currentRow < totalRows; currentRow++ ) {
			if ( Math.abs( A[currentRow][col] ) > Math.abs( A[max_row][col] ) ) {
				max_row = currentRow;
			}
		}

		if ( A[max_row][col] != 0 ) {
			// swap the rows around. Put it in its own scope to remove the temp variable asap
			if ( row != max_row ) {
				var temp = A[ row ];
				A[ row ] = A[ max_row ];
				A[ max_row ] = temp;
			}

			var currentValue = A[row][col]
			for ( var i = 0; i < totalColumns; i++ ) {
				A[ row ][ i ] /= currentValue;
			}

			// u => iterRow
			for ( var iterRow = row + 1; iterRow < totalRows; iterRow++ ) {
				var mulVal = -A[iterRow][col];
				if ( mulVal != 0 && mulVal != -0) {
					for ( var i = 0; i < totalColumns; i++ ) {
						A[ row ][ i ] *= mulVal;
						A[ iterRow ][ i ] += A[ row ][ i ];
						A[ row ][ i ] /= mulVal;
					}
				}
			}
			row++;
		}
		col++;
	}
	return A;
}

// Searches the board and returns an array of tiles that have not yet
// been revealed or flagged, but are adjacent to tiles that have been
// revealed.
function findUsefulUnrevealedTiles() {
	var r = height;
	if ( width > height ) { r = width; }
	return withinRangeCondition( 0, 0, r,
		function(a,b){return !board[a][b].revealed && !board[a][b].flagged && numAdjacentRevealed(a,b) > 0;} );
}

// Searches the board and returns an array of tiles that have been
// revealed and are adjacent to at least one unrevealed, unflagged
// tile.
function findUsefulRevealedTiles() {
	var r = height;
	if ( width > height ) { r = width; }
	return withinRangeCondition( 0, 0, r, 
		function(a,b){ return board[a][b].revealed && numAdjacentUnrevealed(a,b) > 0; } );
}

// Using an array of revealed tiles, constructs a corresponding array of the net
// mine counts (number of adjacent mines - number of adjacent flags).
function getSolVector( revealedTiles ) {
	var solVector = [];
	for ( var i = 0; i < revealedTiles.length; i++ ) {
		var x = revealedTiles[i].x;
		var y = revealedTiles[i].y;
		var df = revealedTiles[i].surroundingMines - numAdjacentFlags( x, y );
		solVector.push( df );
	}
	return solVector;
}

// Given two arrays of revealed tiles (generated by getUsefulRevealedTiles()) 
// and unrevealed tiles (generated by getUsefulUnrevealedTiles()), returns a
// two-dimensional binary array such that each row corresponds to a revealed
// tile, and each column corresponds to an unrevealed tile. An element is 1
// if the corresponding unrevealed tile is adjacent to the corresponding
// revealed tile; an element is zero if this is not the case.
function getMulVector( revealedTiles, unrevealedTiles ) {	
	var mulVector = [];
	for( var i = 0; i < revealedTiles.length; i++ ) {
		var x = revealedTiles[i].x;
		var y = revealedTiles[i].y;
		mulVector.push( [] );
		for ( var j = 0; j < unrevealedTiles.length; j++ ) { mulVector[i].push( 0 ); }
		// find all unknown tiles surrounding this known tile
		var a = getAdjacentUnrevealed( x, y );
		// now, locate such tiles' indices in unrevealedTiles and set those elements of mulVector[i] to 1
		for ( var j = 0; j < a.length; j++ ) {
			mulVector[i][unrevealedTiles.indexOf( a[j] )] = 1;
		}
	}
	return mulVector;
}

// Using a given row-reduced matrix (i.e. the output of gauss(), finds columns that
// must definitely be flagged. Using the given list of unrevealed tiles, finds and
// returns a list of the corresponding tiles on the board. 
function getFlaggableTiles( s, unrevealedTiles ) {
	var tilesToFlag = [];
	for ( var i = 0; i < s.length; i++ ) {
		var sum = 0;
		for ( var j = 0; j < s[i].length - 1; j++ ) {
			sum += Math.abs( s[i][j] );
		}
		if ( sum == s[i][ s[i].length - 1 ] ) {
			for ( var j = 0; j < s[i].length - 1; j++ ) {
				if ( s[i][j] == 1 ) {
					tilesToFlag.push( unrevealedTiles[ j ] );
				}
			}
		}
	}
	return tilesToFlag;
}

// Using a given row-reduced matrix (i.e. the output of gauss(), finds rows that
// have no remaining adjacent unflagged mines. Using the given list of revealed tiles, finds and
// returns a list of the corresponding tiles on the board
function getSafeTiles( s, revealedTiles ) {
	var safeTiles = [];
	for ( var i = 0; i < s.length - 1; i++ ) {
		if ( s[i][ s[i].length - 1 ] == 0 ) {
			safeTiles.push( revealedTiles[i] );
		}
	}
	return safeTiles;
}

// Takes an array that maps a hypothetical board segment, with real tiles representing
// themselves, and null spaces to represent unknown tiles. Also takes a binary array, 
// with each position corresponding to the nth asterisk in strArray. Also takes the focal
// tile, being the tile around which this entire block is centered. Outputs true if 
// the configuration works, false if it doesn't.
function verifyCorrectness( strArray, mineList, focalX, focalY ) {
	var h = strArray.length;
	var w = strArray[0].length;
	var myArray = [];
	var initWidth = 1;
	var initHeight = 1;
	var finalWidth = w - 2;
	var finalHeight = h - 2;
	ct = 0;
	// first, place the mines
	for ( var i = 0; i < h; i++ ) {
		myArray.push([]);
		for ( var j = 0; j < w; j++ ) {
			myArray[i].push( strArray[i][j] );
			if ( !strArray[i][j] ) {
				myArray[i][j] = new MinesweeperTile( i, j, "" );
				if  ( mineList[ct] == 1 ) {
					myArray[i][j].isMine = true;
				} else {
					myArray[i][j].isMine = false;
				}
				ct++;
			}
		}
	}

	// Double-check bounds
	if ( focalX - initHeight <= 1 ) {
		initHeight--; }
	else if ( focalX + finalHeight >= height - 2 ) {
		finalHeight++; }
	if ( focalY - initWidth <= 1 ) {
		initWidth--; }
	else if ( focalY + finalWidth >= width - 2 ) {
		finalWidth++;
	}

	// Next, check correctness, ignoring things that might be outside our field of view
	for ( var i = initHeight; i <= finalHeight; i++ ) {
		for ( var j = initWidth; j <= finalWidth; j++ ) {
			if ( myArray[i][j].revealed ) {
				var expected = myArray[i][j].surroundingMines;
				var observed = getAdjacentCondition( i, j, 
					function(a,b){
						return myArray[a][b].isMine; }, myArray ).length;
				if ( expected != observed ) { return false; }
			}
		}
	}
	return true;
}

// Given a small subsection of the larger array, except with unknowns replaced
// with nulls, brute-forces all possible combinations and returns the set of
// valid ones.
function getCorrectConfigurations( strArray, focalX, focalY ) {
	// Count number of prospective mines
	var n = 0;
	var possibilities = 1;
	var arr = [];
	for ( var i = 0; i < strArray.length; i++ ) {
		for ( var j = 0; j < strArray[i].length; j++ ) {
			if ( !strArray[i][j] ) {
				n++;
				possibilities *= 2;
				arr.push(0);
			}
		}
	}
	// Try 'em all.
	possibilities -= 1;
	var solutions = [];
	var nSolutions = 0;
	// for special case 0
	if ( verifyCorrectness( strArray, arr, focalX, focalY ) ) {
		// copy the array
		solutions.push([]);
		for ( var j = 0; j < arr.length; j++ ) {
			solutions[nSolutions].push( arr[j] );
		}
		nSolutions++;
	}
	// for all other cases
	for ( var i = 0; i < possibilities; i++ ) {
		var pos = arr.length - 1;
		while ( pos >= -1 && arr[pos] == 1 ) {
			arr[pos] = 0;
			pos--;
		}
		arr[pos] = 1;
		if ( verifyCorrectness( strArray, arr, focalX, focalY ) ) {
			// copy the array
			solutions.push([]);
			for ( var j = 0; j < arr.length; j++ ) {
				solutions[nSolutions].push( arr[j] );
			}
			nSolutions++;
		}
	}
	return solutions;
}

// For each item in revealedTiles, carves out a square section of the array and
// tries to brute-force that particular section. 
// Does this until it finds either 100% a mine or 0% a mine; returns that in 
// a 2D array where first element is safe, second is a mine.
// Optionally, a box size can be submitted. In its absence, box size is 2.
function findTank( revealedTiles, boxSize ) {
	var solutions = [[],[]];
	if ( !boxSize ) {
		boxSize = 2; //3
		var largerDimension = width;
		if ( height > width ) { largerDimension = height; }
		if ( withinRangeCondition( 5, 5, largerDimension, 
			function(a,b){return !board[a][b].revealed && !board[a][b].flagged;} ).length <= 10 ) {
			boxSize = largerDimension
		}
	}
	for ( var i = 0; i < revealedTiles.length && solutions[0].length == 0 && solutions[1].length == 0; i++ ) {
		var bcp;
		if ( minesLeft <= mineThreshold ) {
			bcp = getBoardCopy( revealedTiles[i].x, revealedTiles[i].y, boxSize, false, false ); }
		else {
			bcp = getBoardCopy( revealedTiles[i].x, revealedTiles[i].y, boxSize, false ); }
		var ary = bcp[0];
		var ref = bcp[1];

		var sol;
		// Send to brute force solver
		sol = getCorrectConfigurations( ary, revealedTiles[i].x, revealedTiles[i].y );
		if ( sol.length == 0 ) { continue; }
		// check all configurations for consistency
		var ver = [];
		for ( var j = 0; j < sol[0].length; j++ ) {
			ver.push( true );
		}
		for ( var j = 1; j < sol.length; j++ ) {
			for ( var k = 0; k < sol[j].length; k++ ) {
				if ( sol[j][k] != sol[0][k] ) {
					ver[k] = false;
				}
			}
		}
		// If anything did line up, add them to Solutions.
		for ( var k = 0; k < ver.length; k++ ) {
			if ( ver[k] ) {
				if ( sol[0][k] == 0 ) {
					solutions[0].push( ref[k] );
				}
				else {
					solutions[1].push( ref[k] );
				}
			}
		}
	}
	// If solutions found something, return it.
	// Otherwise, return an empty array.
	return solutions;
}

// Given a list of revealed tiles and box size (see findTank()), uses a similar
// process to findTank to brute-force possible solutions; however, instead of
// only choosing solutions with perfect probability, it simply pushes a distribution
// of all possible combinations into an aggregate array for each tile.
// A probability distribution can be made from this.
function aggregateSolutions( revealedTiles, boxSize ) {
	// First, create a board marker
	var boardAgg = [];
	for ( var i = 0; i < height; i++ ) {
		boardAgg.push( [] );
		for ( var j = 0; j < width; j++ ) {
			boardAgg[i].push( [] );
		}
	}

	// At first, use the same procedure as findTank() to get solutions
	if ( !boxSize ) {
		var boxSize = 2; //3
		var largerDimension = width;
		if ( height > width ) { largerDimension = height; }
		if ( withinRangeCondition( 5, 5, largerDimension, 
			function(a,b){return !board[a][b].revealed && !board[a][b].flagged;} ).length <= 10 ) {
			boxSize = largerDimension
		}
	}
	for ( var i = 0; i < revealedTiles.length; i++ ) {
		var bcp;
		if ( minesLeft <= mineThreshold ) {
			bcp = getBoardCopy( revealedTiles[i].x, revealedTiles[i].y, boxSize, false, false ); }
		else {
			bcp = getBoardCopy( revealedTiles[i].x, revealedTiles[i].y, boxSize, false ); }
		var ary = bcp[0];
		var ref = bcp[1];

		var sol;
		// Send to brute force solver
		sol = getCorrectConfigurations( ary, revealedTiles[i].x, revealedTiles[i].y )

		// This is where things get a bit different.
		// Now, having all those sols, let's aggregate the probability data into boardAgg for each one
		for ( var a = 0; a < sol.length; a++ ) {
			for ( var b = 0; b < ref.length; b++ ) {
				boardAgg[ref[b].x][ref[b].y].push( sol[a][b] );
			}
		}
	}
	// Return the aggregated board (which is mostly empty arrays).
	return boardAgg;
}

// Given an aggregate constructed in aggregateSolutions(), finds the approximate probability
// of each square on the board being a mine. Returns a 2D array of numbers corresponding to the
// probability that each tile on the board is a mine. If a tile has already been revealed, its
// probability is returned as 2; flagged tiles are returned as 1.
//
// Note to self, for possible visualization later on: 
// 	https://stackoverflow.com/questions/23830471/convert-image-color-without-changing-its-transparent-background
function getProbabilityFromAggregate( agg ) {
	var r = width;
	if ( height > width ) { r = height; }
	var numUnrevealed = withinRangeCondition( 0, 0, r, function(a,b){ 
		return !board[a][b].revealed && !board[a][b].flagged; } ).length;

	// Create a probability array, and grow it along with the aggregate's size
	var prob = [];
	for ( var i = 0; i < agg.length; i++ ) {
		prob.push( [] );
		for ( var j = 0; j < agg[i].length; j++ ) {
			var p = 0;
			// If the aggregate array for this tile is empty, it means it wasn't solved for.
			// Why?
			if ( agg[i][j].length == 0 ) {
				if ( board[i][j].revealed ) {
					prob[i].push( 2 ); // it's revealed; this is our code for that
				}
				else if ( board[i][j].flagged ) {
					prob[i].push( 1 ); // is definitely a mine
				}
				else {
					// The tile in question is unrevealed, unflagged, and not adjacent.
					// Is it almost adjacent?
					if ( withinRangeCondition( i, j, 2, 
						function(a,b){return board[a][b].revealed;} ).length > 0 ) {
						// A simple way to calculate its probability is just assign it the
						//   raw value of "#mines left / #unknown tiles left".
						// While inaccurate, this will serve its purpose.
						prob[i].push( minesLeft / numUnrevealed );
					}
					else {
						// Otherwise, blind guessing just isn't fun.
						prob[i].push( 0.99 );
					}
				}
				continue;
			}
			// Otherwise, we solved for it in aggregateSolutions().
			// Since 1 = mine, 0 = notMine, then take sum / length for probability.
			var sum = 0;
			for ( var k = 0; k < agg[i][j].length; k++ ) {
				sum += agg[i][j][k];
			}
			prob[i].push( sum / agg[i][j].length );
		}
	}
	// Now we have the probabiltiy map good to go.
	// Return it.
	return prob;
}
