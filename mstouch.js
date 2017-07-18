// WARNING: WORK IN PROGRESS
//
// NOTHING HERE IS USEFUL YET

// For mobile, determines when a touch starts
var touchTimer;
var longTouchDuration = 500;

// Activated when touch impact starts on mobile
// Ref: https://stackoverflow.com/questions/6139225/how-to-detect-a-long-touch-with-pressure-with-javascript-for-android-and-iphone
function touchDown() {
	touchTimer = setTimeout( setFlagged, longTouchDuration );
}

// Companion function to catch a short tap and stop it from being a right-click
function touchUp() {
	// stops short touches from firing the event
	if ( touchTimer )
		clearTimeout( touchTimer );
}


