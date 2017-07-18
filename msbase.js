// Define a specific type to encapsulate everything about a minesweeper tile
function MinesweeperTile( xc, yc, imgp ) {
	this.x = xc;
	this.y = yc;
	this.img = imgp;
	this.revealed = false;
	this.isMine = false;
	this.surroundingMines = 0;
	this.obj = null;
	this.flagged = false;
}

// Global variables
var board = null;
var boardGenerated = false;
var height = 16;
var width = 30;
var numMines = 99;
var gameOver = false;
var time = 0;
var timer = null;
var mineCt = numMines;
var minesLeft = numMines;
let mineThreshold = 4;
