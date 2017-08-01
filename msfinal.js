/* @file msfinal.js
 * @author Louis Jacobowitz
 *
 * Description:
 ** This file contains functions responsible for resolving a game once
 **   the game is ended. Wrap-up procedures are also in place. 
 *
 * Prerequisites:
 ** > msaction.js - performs checks to verify end-of-game, and then calls these functions
 *
 * Dependencies:
 ** > msbase.js - for declaring constants and data types
 ** > msboard.js - freezing and resetting visible counters
 ** > msutils.js - flagging tiles that were not already flagged
 */

// Handles game over if the user clicked on a mine.
function gotGameOver( x, y ) {
	clearInterval( timer );
	for ( i = 0; i < height; i++ ) {
		for ( j = 0; j < width; j++ ) {
			if ( board[i][j].isMine && !board[i][j].flagged && !( i == x && j == y  ) ) {
				board[i][j].obj.src = tileMine;
			}
			else if ( !board[i][j].isMine && board[i][j].flagged ) {
				board[i][j].obj.src = tileMineFake;
				unhighlightAllTiles();
			}
		}
	}
	document.getElementById( "other1" ).innerHTML = "You hit a mine and lost! Click anywhere to try again.";
	document.getElementById( "faceTile" ).src = "assets/face-dead.png";
	gameOver = true;
}

// Checks for the game having been successfully won – if every tile is either revealed or
// is a mine
function gameWasWon() {
	for ( i = 0; i < height; i++ ) {
		for ( j = 0; j < width; j++ ) {
			if ( !board[i][j].revealed && !board[i][j].isMine ) {
				return false;
			}
		}
	}
	document.getElementById( "faceTile" ).src = "assets/face-win.png";
	clearInterval( timer );
	// flag all remaining unflagged tiles
	for ( i = 0; i < height; i++ ) {
		for ( j = 0; j < width; j++ ) {
			if ( !board[i][j].revealed && !board[i][j].flagged ) {
				tileFlagged( i, j, board[i][j].obj );
			}
		}
	}
	setMinesLeft( 0 );
	return true;
}
