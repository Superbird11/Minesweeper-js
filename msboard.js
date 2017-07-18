/* @file board.js
 * @author Louis Jacobowitz
 * 
 * Description:
 ** This file contains functions that either directly manipulate HTML objects,
 **   or react to the user's actions on the raw HTML.
 *
 * Prerequisites:
 ** > mssetup.js - required to set up HTML elements before these functions manipulate them
 *
 * Dependencies:
 ** > mssetup.js - for resetting the board
 ** > msaction.js - for redirecting click actions
 */

// Sets the time number image to the given digits (0-9)
function setTime( d0, d1, d2 ) {
	if ( d0 < 0 || d0 > 9 || d1 < 0 || d1 > 9 || d2 < 0 || d2 > 9 ) {
		console.log( "Invalid time set: " + d0 + "," + d1 + "," + d2 );
	}
	// get elements by ID
	t1 = document.getElementById( "timerTile1" );
	t2 = document.getElementById( "timerTile2" );
	t3 = document.getElementById( "timerTile3" );

	t1.src = "assets/number-" + d0 + ".png";
	t2.src = "assets/number-" + d1 + ".png";
	t3.src = "assets/number-" + d2 + ".png";
}

// Sets the mines left number images to the given number
function setMinesLeft( num ) {
	t1 = document.getElementById( "mineCtTile1" );
	t2 = document.getElementById( "mineCtTile2" );
	t3 = document.getElementById( "mineCtTile3" );

	t1.src = "assets/number-" + Math.floor( (num % 1000) / 100 ) + ".png"
	t2.src = "assets/number-" + Math.floor( (num % 100) / 10 ) + ".png"
	t3.src = "assets/number-" + (num % 10) + ".png"

	minesLeft = num;
}

// Increments the timer, and calls setTime() with the new time.
function incrementTime() {
	time++;
	if ( time > 999 ) {
		setTime( 9, 9, 9 );
	} else {
		t1 = Math.floor( time / 100 );
		t2 = Math.floor( (time % 100) / 10 );
		t3 = time % 10;
		setTime( t1, t2, t3 );
	}	
}

// Activates when the face button is pressed. Starts a new game.
function faceTileClicked() {
	clearInterval( timer );
	loadMinesweeper();
	document.getElementById( "faceTile" ).src = "assets/face-happy.png";
}

// Makes the face logo be surprised
function mouseDown() {
	if ( !gameOver ) {
		document.getElementById( "faceTile" ).src = "assets/face-surprised.png";
	}
}

// Declares a variable as an event; needed for communication between two discrete functons
var evt = null;

// Sets event equal to the given event on click; is called immediately before detectClick.
function setEvent( e ) {
	evt = e;
	return false;
}

// Determines whether a click is a left click or a right click
function detectClick( x, y, img ) {
	// ref: stackoverflow.com/questions/2405771/is-right-click-a-javascript-event
	if ( !gameOver ) {
		document.getElementById( "faceTile" ).src = "assets/face-happy.png";
	}
	var rightclick = false;
	if ( !evt ) { evt = window.event; }
	if ( evt.which ) { rightclick = (evt.which == 3); }
	else if ( evt.button ) { rightclick = (evt.button == 2); }
	
	if ( rightclick ) { tileFlagged( x, y, img ); }
	else { tileClicked( x, y, img ); }

	// reset evt
	evt = null;
	return false;
}


