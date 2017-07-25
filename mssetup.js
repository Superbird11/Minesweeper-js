/* @file mssetup.js
 * @author Louis Jacobowitz
 * 
 * Description: 
 ** This file contains functions geared towards setting up the game board.
 ** Functions that change fundamental properties for every tile on the board
 **   belong here, as well as functions that generate raw HTML code for the
 **   board.
 *
 * Dependencies:
 ** > msbase.js - Declares basic data structures, like tiles, that are initialized here
 ** > msboard.js - For initializing certain HTML objects it creates (e.g. timer, mine counter)
 */

// Sets the surrounding mine counts of every tile based on how many mines surround that tile.
function setSurroundingMines() {
	for ( var i = 0; i < height; i++ ) {
		for ( var j = 0; j < width; j++ ) {
			board[ i ][ j ].surroundingMines = numAdjacentMines( i, j );
		}
	}
}

// Sets all tiles to be unrevealed (programmatically, not visually)
function unrevealEverything() {
	for ( var i = 0; i < height; i++ ) {
		for ( var j = 0; j < width; j++ ) {
			board[ i ][ j ].revealed = false;
		}
	}
}

// Sets the DOM object associated with each tile
function setObj() {
	for ( var i = 0; i < height; i++ ) {
		for ( var j = 0; j < width; j++ ) {
			board[ i ][ j ].obj = document.getElementById( "tile_" + i + "_" + j );
		}
	}
}

// Generates the minesweeper board.
function generateBoard( x, y ) {
	// initialize board
	board = [];
	for ( var i = 0; i < height; i++ ) {
		board.push( [] );
		for ( j = 0; j < width; j++ ) {
			board[ i ].push( new MinesweeperTile( i, j, "assets/squareUnknown.png" ) );
		}
	}

	// Set mines on board
	mineCt = numMines;
	while ( numMines >= 0 ) {
		var randX = Math.floor( Math.random() * height );
		var randY = Math.floor( Math.random() * width );
		if ( (randX - x >= -1 && randX - x <= 1) &&
		     (randY - y >= -1 && randY - y <= 1) ) { continue; }
		if ( !board[ randX ][ randY ].isMine ) {
			board[ randX ][ randY ].isMine = true;
			mineCt--;
		}
		if ( mineCt <= 0 ) { break; }
	}
	// Set numbers
	setSurroundingMines();
	unrevealEverything();
	setObj();

	gameOver = false;
	boardGenerated = true;
	mineCt = numMines;
	timer = 0;
	setMinesLeft( mineCt );
	setTime( 0, 0, 0 );
	timer = setInterval( function() { incrementTime() }, 1000 );
	document.getElementById( "other1" ).innerHTML = "Play minesweeper!";
}

// Initializes a game of Minesweeper.
function loadMinesweeper() {
	// First, get parameters from URL
	var url = window.location.href;

	var w = /w=([^&]+)/.exec(url)[1];
	var h = /h=([^&]+)/.exec(url)[1];
	var m = /m=([^&]+)/.exec(url)[1];

	// Verify parameters, and if valid then set.
	if ( !w || isNaN( w ) || w < minWidth ) { width = defaultWidth; } else { width = (w / 1); }
	if ( !h || isNaN( h ) || h < minHeight ) { height = defaultHeight; } else { height = (h / 1); }
	if ( !m || isNaN( m ) || m < minMines  ) { numMines = defaultMines; } else { numMines = (m / 1); }
	if ( numMines > (width * height - 9) ) { numMines = width * height - 9; }
	mineCt = numMines;
	minesLeft = numMines;

	// Initialize visual element
	var boardHTML = "<table id=\"squareBoardTable\" class=\"boardTable\" unselectable=\"on\">";
	// Print top row
	boardHTML = boardHTML + "<tr id=\"boardTop_1\" class=\"boardRow\" unselectable=\"on\" oncontextmenu=\"return false;\"><td id=\"boardTop_1_start\" class=\"borderTile\" unselectable=\"on\" oncontextmenu=\"return false;\"><img src=\"assets/border-topleft.png\" id=\"border_1_start\" class=\"minesweeperTile\" oncontextmenu=\"return false;\" unselectable=\"on\" ondragstart=\"return false;\" ondrop=\"return false;\" /></td>";
        for ( i = 0; i < width; i++ ) {
		boardHTML = boardHTML + "<td id=\"boardTop_1_" + i + "\" class=\"borderTile\" unselectable=\"on\" oncontextmenu=\"return false;\"><img src=\"assets/border-horizontal.png\" id=\"border_1_" + i + "\" class=\"minesweeperTile\" oncontextmenu=\"return false;\" unselectable=\"on\" ondragstart=\"return false;\" ondrop=\"return false;\" /></td>";
	}
	boardHTML = boardHTML + "<td id=\"boardTop_1_end\" class=\"borderTile\" unselectable=\"on\" oncontextmenu=\"return false;\"><img src=\"assets/border-topright.png\" id=\"border_1_end\" class=\"minesweeperTile\" oncontextmenu=\"return false;\" unselectable=\"on\" ondragstart=\"return false;\" ondrop=\"return false;\" /></td></tr>";
	// Print second row
	boardHTML = boardHTML + "<tr id=\"boardTop_2\" class=\"boardRow\" unselectable=\"on\" oncontextmenu=\"return false;\"><td id=\"boardTop2_start\" class=\"borderTile\" unselectable=\"on\" oncontextmenu=\"return false;\"><img src=\"assets/border-tallLeft.png\" id=\"border_2_start\" class=\"minesweeperTile\" oncontextmenu=\"return false;\" unselectable=\"on\" ondragstart=\"return false;\" ondrop=\"return false;\" /></td>";
	// Second row's interior is actually three big cells.
	// First, the leftmost cell is for the timer. 
	//	Needs three cells worth of space
	boardHTML = boardHTML + "<td id=\"boardTop_2_1\" class=\"timerCell\" unselectable=\"on\" oncontextmenu=\"return false;\" colspan=\"3\" style=\"background-color:#C0C0C0; text-align: left;\"><img src=\"assets/number-0.png\" id=\"mineCtTile1\" class=\"mineCtTile\" oncontextmenu=\"return false;\" unselectable=\"on\" ondragstart=\"return false;\" ondrop=\"return false;\" /><img src=\"assets/number-0.png\" id=\"mineCtTile2\" class=\"mineCtTile\" oncontextmenu=\"return false;\" unselectable=\"on\" ondragstart=\"return false;\" ondrop=\"return false;\" /><img src=\"assets/number-0.png\" id=\"mineCtTile3\" class=\"mineCtTile\" oncontextmenu=\"return false;\" unselectable=\"on\" ondragstart=\"return false;\" ondrop=\"return false;\" /></td>";
	// Next, the smiley face in the middle. This is easy.
	boardHTML = boardHTML + "<td id=\"boardTop_2_2\" class=\"faceCell\" unselectable=\"on\" oncontextmenu=\"return false;\" colspan=\"" + (width - 6) + "\" style=\"background-color:#C0C0C0; text-align:center;\"><img src=\"assets/face-happy.png\" id=\"faceTile\" class=\"faceTileC\" onmousedown=\"mouseDown();\" onmouseup=\"faceTileClicked();\" oncontextmenu=\"return false;\" unselectable=\"on\" ondragstart=\"return false;\" ondrop=\"return false;\" /></td>";
	// Finally, the rightmost cell is for the mine count. 
	// 	Like the timer, needs three cells of space
	boardHTML = boardHTML + "<td id=\"boardTop_2_3\" class=\"timerCell\" unselectable=\"on\" oncontextmenu=\"return false;\" colspan=\"3\" style=\"background-color:#C0C0C0; text-align:right;\"><img src=\"assets/number-0.png\" id=\"timerTile1\" class=\"timerTile\" oncontextmenu=\"return false;\" unselectable=\"on\" ondragstart=\"return false;\" ondrop=\"return false;\" /><img src=\"assets/number-0.png\" id=\"timerTile2\" class=\"timerTile\" oncontextmenu=\"return false;\" unselectable=\"on\" ondragstart=\"return false;\" ondrop=\"return false;\" /><img src=\"assets/number-0.png\" id=\"timerTile3\" class=\"timerTile\" oncontextmenu=\"return false;\" unselectable=\"on\" ondragstart=\"return false;\" ondrop=\"return false;\" /></td>";
	boardHTML = boardHTML + "<td id=\"boardTop2_end\" class=\"borderTile\" unselectable=\"on\" oncontextmenu=\"return false;\"><img src=\"assets/border-tallRight.png\" id=\"border_2_end\" class=\"minesweeperTile\" oncontextmenu=\"return false;\" unselectable=\"on\" ondragstart=\"return false;\" ondrop=\"return false;\" /></td>";

	// Print third row
	boardHTML = boardHTML + "<tr id=\"boardTop_3\" class=\"boardRow\" unselectable=\"on\" oncontextmenu=\"return false;\"><td id=\"boardTop_3_start\" class=\"borderTile\" unselectable=\"on\" oncontextmenu=\"return false;\"><img src=\"assets/border-leftjunction.png\" id=\"border_3_start\" class=\"minesweeperTile\" oncontextmenu=\"return false;\" unselectable=\"on\" ondragstart=\"return false;\" ondrop=\"return false;\" /></td>";
        for ( i = 0; i < width; i++ ) {
		boardHTML = boardHTML + "<td id=\"boardTop_3_" + i + "\" class=\"borderTile\" unselectable=\"on\" oncontextmenu=\"return false;\"><img src=\"assets/border-horizontal.png\" id=\"border_3_" + i + "\" class=\"minesweeperTile\" oncontextmenu=\"return false;\" unselectable=\"on\" ondragstart=\"return false;\" ondrop=\"return false;\" /></td>";
	}
	boardHTML = boardHTML + "<td id=\"boardTop_3_end\" class=\"borderTile\" unselectable=\"on\" oncontextmenu=\"return false;\"><img src=\"assets/border-rightjunction.png\" id=\"border_3_end\" class=\"minesweeperTile\" oncontextmenu=\"return false;\" unselectable=\"on\" ondragstart=\"return false;\" ondrop=\"return false;\" /></td></tr>";
	// Print rest of board
	for ( i = 0; i < height; i++ ) {
		boardHTML = boardHTML + "<tr id=\"boardRow_" + i + "\" class=\"boardRow\" unselectable=\"on\" oncontextmenu=\"return false;\"><td id=\"boardRow_" + i + "_start\" class=\"borderTile\" unselectable=\"on\" oncontextmenu=\"return false;\"><img src=\"assets/border-vertical.png\" id=\"border_" + i + "_start\" class=\"minesweeperTile\" oncontextmenu=\"return false;\" unselectable=\"on\" ondragstart=\"return false;\" ondrop=\"return false;\" /></td>";
		for ( j = 0; j < width; j++ ) {
			boardHTML = boardHTML + "<td id=\"boardCell_" + i + "_" + j + "\" class=\"boardCell\" unselectable=\"on\" oncontextmenu=\"return false;\">" + "<img src=\"assets/squareUnknown.png\" id=\"tile_" + i + "_" + j + "\" class=\"minesweeperTile\" onmouseup=\"setEvent(event); detectClick(" + i + "," + j + ",this);\" onmousedown=\"mouseDown();\" ontouchstart=\"touchDown();\" ontouchend=\"touchUp();\" oncontextmenu=\"return false;\" unselectable=\"on\" ondragstart=\"return false;\" ondrop=\"return false;\" /></td>";
		}
		boardHTML = boardHTML + "<td id=\"boardRow_" + i + "_end\" class=\"borderTile\" unselectable=\"on\" oncontextmenu=\"return false;\"><img src=\"assets/border-vertical.png\" id=\"border_" + i + "_end\" class=\"minesweeperTile\" oncontextmenu=\"return false;\" unselectable=\"on\" ondragstart=\"return false;\" ondrop=\"return false;\" /></td></tr>";
	}
	// print the bottom row
	boardHTML = boardHTML + "<tr id=\"boardBottom\" class=\"boardRow\" unselectable=\"on\" oncontextmenu=\"return false;\"><td id=\"boardBottom_start\" class=\"borderTile\" unselectable=\"on\" oncontextmenu=\"return false;\"><img src=\"assets/border-bottomleft.png\" id=\"border_b_start\" class=\"minesweeperTile\" oncontextmenu=\"return false;\" unselectable=\"on\" ondragstart=\"return false;\" ondrop=\"return false;\" /></td>";
        for ( i = 0; i < width; i++ ) {
		boardHTML = boardHTML + "<td id=\"boardBottom_" + i + "\" class=\"borderTile\" unselectable=\"on\" oncontextmenu=\"return false;\"><img src=\"assets/border-horizontal.png\" id=\"border_b_" + i + "\" class=\"minesweeperTile\" oncontextmenu=\"return false;\" unselectable=\"on\" ondragstart=\"return false;\" ondrop=\"return false;\" /></td>";
	}
	boardHTML = boardHTML + "<td id=\"boardBottom_end\" class=\"boardRow\" unselectable=\"on\" oncontextmenu=\"return false;\"><img src=\"assets/border-bottomright.png\" id=\"border_b_end\" class=\"minesweeperTile\" oncontextmenu=\"return false;\" unselectable=\"on\" ondragstart=\"return false;\" ondrop=\"return false;\" /></td></tr></table>";

	document.getElementById( "board" ).innerHTML = boardHTML;
	document.getElementById( "other1" ).innerHTML = "Click somewhere to begin!";

	// Set initial time and number of mines
	time = 0;
	setTime( 0, 0, 0 );
	setMinesLeft( numMines );

	gameOver = false;
	boardGenerated = false;
}
