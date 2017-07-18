/* @file msaction.js
 * @author Louis Jacobowitz
 *
 * Description:
 ** This file contains functions that react to and manage user actions, including
 **   clicking and tapping.
 *
 * Prerequisites:
 ** > msboard.js - contains functions that recognize interactions with the board,
 **     redirecting them here
 *
 * Dependencies: 
 ** > mabase.js - defines core data structures and global variables
 ** > msai.js - to call AI subroutines to validate wrong moves
 ** > mscheck.js - to follow-up on the above, and accommodate mistakes gracefully
 ** > msboard.js - manipulating mine count when flagging
 ** > mssetup.js - required to generate the board before it's initialized
 ** > msutils.js - uses functions to count number of adjacent tiles
 ** > msfinal.js - after detecting the end of a game, end-of-game routines are called here
 */

// Activates when a tile on the Minesweeper board is clicked/tapped.
function tileClicked( x, y, img ) {
	if ( gameOver ) { return; }
	if ( !boardGenerated ) { generateBoard( x, y ); }

	var tile = board[ x ][ y ];
	if ( tile.revealed && numAdjacentFlags( x, y ) == tile.surroundingMines ) {
		// reveal all surrounding tiles
		var ut = getAdjacentUnrevealed( x, y );
		for ( var i = 0; i < ut.length; i++ ) {
			tileClicked( ut[i].x, ut[i].y, ut[i].obj );
		}
	}
	else if ( tile.revealed || tile.flagged ) { return; }
	else if ( tile.isMine ) {
		// Can the AI fix this?
		var aimoves = AIGetMove();
		if ( aimoves[0].length == 0 && aimoves[1].length == 0 ) {
			// it was a guess. Reshuffle.
			reshuffle( x, y );
		}
	}

	tile.revealed = true;
	if ( tile.isMine ) { 
		img.src = tileMineTripped; 
		gotGameOver( x, y );
	}
	else if ( tile.surroundingMines == 0 ) {
		img.src = tile0;
		// reveal all surrounding tiles
		var ut = getAdjacentUnrevealed( x, y );
		for ( var i = 0; i < ut.length; i++ ) {
			tileClicked( ut[i].x, ut[i].y, ut[i].obj );
		}
	}
	else if ( tile.surroundingMines == 1 ) { img.src = tile1; }
	else if ( tile.surroundingMines == 2 ) { img.src = tile2; }
	else if ( tile.surroundingMines == 3 ) { img.src = tile3; }
	else if ( tile.surroundingMines == 4 ) { img.src = tile4; }
	else if ( tile.surroundingMines == 5 ) { img.src = tile5; }
	else if ( tile.surroundingMines == 6 ) { img.src = tile6; }
	else if ( tile.surroundingMines == 7 ) { img.src = tile7; }
	else if ( tile.surroundingMines == 8 ) { img.src = tile8; }
	tile.img = img.src;


	if ( gameWasWon() ) {
		gameOver = true;
		document.getElementById( "other1" ).innerHTML = "Congratulations! You won! Click anywhere to try again.";
	}
}

// Activated on a right-click. This flags a tile.
function tileFlagged( x, y, img ) {
	var tile = board[x][y];
	if ( !boardGenerated || tile.revealed || gameOver ) { return; }

	if ( tile.flagged ) {
		tile.flagged = false;
		tile.img = tileUnknown;
		img.src = tileUnknown;
		mineCt++;
		setMinesLeft( mineCt );
	}
	else {
		tile.flagged = true;
		tile.img = tileFlag; 
		img.src = tileFlag; 
		mineCt--;
		setMinesLeft( mineCt );
	}
}

