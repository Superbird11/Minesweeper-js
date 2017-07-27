/* @file mshighlight.js
 * @author Louis Jacobowitz
 *
 * Description:
 ** This file contains a suite of functions for highlighting and unhighlighting
 **   mine tiles, as well as ways to designate what color and intensity highlighting
 **   should be. 
 ** The highlighting is accomplished via the table's background color. Doing it
 **   strictly by table cell would stop working once non-rectangular board types
 **   were approached, and the table would be an illusion.
 ** This carries the limitation of forcing all highlights to be one color, but
 **   that's not a huge issue.
 *
 * Dependencies:
 ** > msbase.js - defines the tiles' datatype
 ** > minesweeper.css - defines default board highlight color (in table's 
 **     background-color attribute)
 */

// Internal list of tiles that have been highlighted
var highlightedTiles = [];
// Opacity constant defined here, defines degree of highlight
let opacityConstant = 0.6;

// Sets the highlight color (the table's background color) to the given value
function setHighlightColor( val ) {
	var tbl = document.getElementsByClass( "boardTable" )[0];
	tbl.style.backgroundColor = val;
}

// Sets the opacity constant (degree of highlight, 0 is stronger) 
//   to the given value.
function setOpacityConstant( val ) {
	if ( val < 0 || val > 1 ) { return; }
	opacityConstant = val;
}

// Sets the tile from board at coordinates (x,y) to half-opacity,
//   so as to give the illusion of highlighting it against the
//   colored background.
// Also registers having done so.
function highlightTile( tile ) {
	var img = tile.obj;

	// Now, register the tile in an internal registry of tiles that have been highlighted
	highlightedTiles.push( tile );
	// Finally, "highlight" tile by setting opacity to half
	img.style.opacity = opacityConstant;
}

// Sets the tile from board at coordinates (x,y) to full opacity,
//   so as to undo the illusion of highlighting it against the
//   colored background.
// Also registers having done so, removing the tile from the list of
//   highlighted tiles.
function unhighlightTile( tile ) {
	var img = tile.obj;

	// Remove the tile from the internal registry, if it's there
	var idx = highlightedTiles.indexOf( tile );
	if ( idx >= 0 ) { 
		highlightedTiles.splice( idx, 1 );
	}
	// Unhighlight the tile by setting opacity to full.
	img.style.opacity = 1.0; 
}

// Unhighlights all the tiles that are currently registered as being highlighted.
function unhighlightAllTiles() {
	for ( var i = 0; i < highlightedTiles.length; i++ ) {
		unhighlightTile( highlightedTiles[i] );
	}
}
