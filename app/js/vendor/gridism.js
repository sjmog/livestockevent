//helpers

function isInt(p) {
	return p%1 === 0
};

//n = number of columns
function gridify() {
	var n = $('.container').width()/320; //or whatever the tile container column width is
	var allElements = $('.tile'); //all tiles
	allElements.each(function() {
		$(this).removeClass('fractional-inner'); //set back to the beginning case each time
		if ($(this).attr('style') === ' ') {
			$(this).addClass('tileHidden'); //add a nullifying class to all hidden elements
		} else {
			$(this).removeClass('tileHidden'); //remove the nullifying class from elements that have come back into view
		};
	});
	var elements = allElements.filter(":visible"); //all visible tiles
	var tileNumber = elements.length; //the number of tiles in the grid
	console.log('Number of tiles in grid: ' + tileNumber);
	console.log('Number of columns: ' + n);
	var currentElement = null;
	var currentRow = 1;
	var currentElementHeight = null;
	var sumHeight = 0;
	for (var i=0; i < tileNumber; i++) {
		currentElement = $(elements[i]); //get the current tile under inspection and wrap as jQuery object
		console.log('Current Element is ' + currentElement.attr('class'));
		if (sumHeight < n) {
			sumHeight += parseFloat(currentElement.attr('data-height')); //get height of tile from data-attribute, in row units
			console.log('sum of heights in this row is now ' + sumHeight);
		}
		else {
			sumHeight = parseFloat(currentElement.attr('data-height')); //if the sum of heights is greater than the column number, reset sumHeight to start iterating over a new row, seeding with the first tile
			currentRow += 1;
			console.log('Moving on to row ' + currentRow);
		};
		if (isInt(sumHeight)) {
			console.log('current tile fills the row, moving on.'); //if the sum of heights is an integer then do nothing
			
		}
		else {
			console.log('We have a partially-heighted element!');
			if (sumHeight < (n-1)) {
				console.log('Tile is not in the last column, applying appropriate styles...');
				currentElement.addClass('fractional-inner'); //if we're not in the last column in the row, move any subsequent tiles around
			}
			else {
				console.log('Tile is in the last column, removing appropriate styles...');
				currentElement.removeClass('fractional-inner'); //if we are in the last column in the row, remove all classes that invoke movement in subsequent tiles
			}
		}
	}
}