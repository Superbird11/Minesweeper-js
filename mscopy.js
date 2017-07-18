/* @file mscopy.js
 * @author Louis Jacobowitz
 *
 * Description:
 ** This file contains a method that creates a deep copy of the board, including
 **   a deep copy of all elements on the board.
 *
 * Prerequisites:
 ** > mssetup.js - routine will fail if board is not initialized
 *
 * Dependencies:
 ** > msutils.js - for finding number of adjacent revealed tiles
 ** > msbase.js - defines data structure and constants
 */

// Creates and returns an array of Tiles that is a deep copy of a subsection
// of the board. Takes the coordinates of the tile to focus around, and the
// distance away from that tile to make the subsection.
// If typicalBlank is unspecified, then possible blanks are made nulls instead.
// Returns a 2D array. The first element is the created board copy. The second
//   element is the ref array of tiles replaced with null; only relevant if
//   typicalBlank is false.
function getBoardCopy( row, col, boxSize, typicalBlank = false, advBlank = true ) {
	// check bounds
	var stx = row - boxSize;
	var sty = col - boxSize;
	var edx = row + boxSize;
	var edy = col + boxSize;
	if ( stx < 0 ) { stx = 0; }
	if ( sty < 0 ) { sty = 0; }
	if ( edx >= height ) { edx = height - 1; }
	if ( edy >= width ) { edy = width - 1; }
	// construct 2D arrays
	var ary = [];
	var ref = [];
	var arySize = 0;
	for ( var a = stx; a <= edx; a++ ) {
		ary.push( [] );
		for ( var b = sty; b <= edy; b++ ) {
			if ( !typicalBlank && !board[a][b].revealed && !board[a][b].flagged && numAdjacentRevealed(a, b) > 0 ) {
				ary[ arySize ].push( null );
				ref.push( board[a][b] );
			}
			else if ( !advBlank && !board[a][b].revealed && !board[a][b].flagged ) {
				ary[ arySize ].push( null );
				ref.push( board[a][b] );
			}
			else {
				var copy = new MinesweeperTile( board[a][b].x, board[a][b].y, board[a][b].img );
				copy.revealed = board[a][b].revealed;
				copy.isMine = board[a][b].isMine;
				copy.surroundingMines = board[a][b].surroundingMines;
				copy.obj = board[a][b].obj;
				copy.flagged = board[a][b].flagged;
				ary[ arySize ].push( copy );
			}
		}
		arySize++;
	}
	return [ary, ref];
}
