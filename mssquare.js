/* @file square.js
 * @author Louis Jacobowitz
 *
 * Description:
 ** This file declares assets specific to a square/rectangular Minesweeper layout
 **   (the traditional format), as well as a function for accessing all tiles
 **   within a certain range of the target tile on a given board. 
 *
 * Prerequisites:
 **  None
 *
 * Dependencies:
 **  assets/square*.png
 */

// Many declarations of the names of various assets
let tile0 = "assets/square0.png";
let tile1 = "assets/square1.png";
let tile2 = "assets/square2.png";
let tile3 = "assets/square3.png";
let tile4 = "assets/square4.png";
let tile5 = "assets/square5.png";
let tile6 = "assets/square6.png";
let tile7 = "assets/square7.png";
let tile8 = "assets/square8.png";
let tileUnknown = "assets/squareUnknown.png";
let tileFlag = "assets/squareFlagged.png";
let tileMineTripped = "assets/squareMineTripped.png";
let tileMine = "assets/squareMine.png";
let tileMineFake = "assets/squareMineFake.png";

// Searches the square area around the given coordinates, r being
// the radius of the search. Returns the tiles found that satisfy
// the given boolean function.
function _withinRangeCondition( x, y, r, cond, brd ) {
	if ( !brd ) { brd = board; }
	var ret = [];
	for ( var a = x-r; a <= x+r; a++ ) {
		for ( var b = y-r; b <= y+r; b++ ) {
			if ( a == x && b == y ) { continue; }
			if ( a < 0 || a >= brd.length || b < 0 || b >= brd[a].length ) { continue; }
			if ( cond( a, b ) ) { ret.push( brd[a][b] ); }
		}
	}
	return ret;
}
