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

var gameOver = false;
var time = 0;
var timer = null;

var minHeight = 8;
var minWidth = 8;
var minMines = 1;
var defaultHeight = 16;
var defaultWidth = 30;
var defaultMines = 99;

var height = defaultHeight;
var width = defaultWidth;
var numMines = defaultMines;

var mineCt = numMines;
var minesLeft = numMines;
let mineThreshold = 4;
