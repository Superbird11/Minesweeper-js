/* @file msutils.js
 * @author Louis Jacobowitz
 *
 * Description:
 ** This is a collection of utility functions; shortcuts. 
 ** These functions return lists, or the number of items in such lists, that contain
 **   tiles adjacent to the speciried tile that fulfill a certain condition.
 ** The general-purpose functions forming the backbone of these is in one of this file's
 **   mutually-exclusive dependencies, depending on the type of board in question.
 *
 * Prerequisites:
 ** > mssetup.js - none of these functions will work if the board has not yet been
 **     set up / initialized, which the functions in this prerequisite do.
 *
 * Dependencies:
 ** > msbase.js - declares fundamental constants and types.
 ** > mssquare.js XOR mstriangle.js XOR mshexagon.js - contains root method for
 **     searching adjacent tiles, depending on tile layout
 */

// A general function that returns all of the functions in a certain radius `r`
// of (`x`, `y`) on `brd` that make `cond` return true. Is mechanically different
// for each different board type, so this is only a global declaration; the function
// is properly defined in a dependency.
// `cond` is a function that takes (x,y) and returns a boolean.
function withinRangeCondition( x, y, r, cond, brd ) {
	return _withinRangeCondition( x, y, r, cond, brd );		
}

// Returns an array of tiles surrounding the given x,y coordinates,
// that satisfy the given boolean function.
// The ``cond`` parameter must be a function that takes as parameters
// a set of (x,y) coordinates, and returns a boolean.
function getAdjacentCondition( x, y, cond, brd ) {
	return withinRangeCondition( x, y, 1, cond, brd );
}

// Returns an array of the mines adjacent to the given tile
function getAdjacentMines( x, y ) {
	return getAdjacentCondition( x, y, function(a,b){return board[a][b].isMine;} );
}

// Returns an array of the mines adjacent to the given tile that haven't been flagged.
function getAdjacentUnflaggedMines( x, y ) {
	return getAdjacentCondition( x, y, function(a,b){return board[a][b].isMine && !board[a][b].flagged;} );
}

// Returns an array of the flagged tiles adjacent to the given tile
function getAdjacentFlags( x, y ) {
	return getAdjacentCondition( x, y, function(a,b){return board[a][b].flagged;} );
}

// Returns an array of the revealed tiles adjacent to the given tile
function getAdjacentRevealed( x, y ) {
	return getAdjacentCondition( x, y, function(a,b){return board[a][b].revealed;} );
}

// Returns an array of the unrevealed, unflagged tiles adjacent to the given tile
function getAdjacentUnrevealed( x, y ) {
	return getAdjacentCondition( x, y, function(a,b){return (!board[a][b].revealed && !board[a][b].flagged)} );
}

// Returns the number of revealed tiles surrounding this tile
function numAdjacentRevealed( x, y ) {
	return getAdjacentRevealed( x, y ).length;
}

// Returns the number of unrevealed tiles surrounding this tile
function numAdjacentUnrevealed( x, y ) {
	return getAdjacentUnrevealed( x, y ).length;
}

// Returns the number of mines in the squares surrounding this tile, up to 8
function numAdjacentMines( x, y ) {
	return getAdjacentMines( x, y ).length;
}

// Returns the number of tiles surrounding this tile that have been flagged
function numAdjacentFlags( x, y ) {
	return getAdjacentFlags( x, y ).length;
}
