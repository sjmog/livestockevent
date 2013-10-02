//helpers

function isInt(p) {
	return p%1 === 0
};

//n = number of columns
function gridify() {
	$('.filler').remove(); //remove all filler tiles
	var n = $('.container').width()/320; //or whatever the tile container column width is
	var theElements = $('.tile'); //all tiles
	var allElements = theElements.filter(":not(.filters):not(.logo):not(.footer)"); //filter out the filters, the logo, if there is one, and the footer
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
	var totalHeight = function() {
		var h = 0;
		for (var x = 0; x < elements.length; x++) {
			var elHeight = parseFloat($(elements[x]).attr('data-height'));
			var elWidth = parseFloat($(elements[x]).attr('data-width'));
			var elArea = elHeight * elWidth;
		    h+= elArea;
		};
		return h;
	}
	var remainder = n-totalHeight()%n;
	console.log('Number of tiles in grid: ' + tileNumber);
	console.log('Number of columns: ' + n);
	console.log('Total sum of heights: ' + totalHeight());
	console.log('remainder is ' + remainder);
	var inserter = null;
	// for random insertion
	// for (var y=0; y<remainder; y++) {
	// 	inserter = elements[Math.floor(Math.random()*elements.length)]; //get an element at a random position in the elements array
	// 	$(inserter).after('<div class="tile filler image-tile mix general_info all tile-1-wide" data-height="1" data-width="1"><img src="img/random-2.jpg"></div>'); //insert a random image on half gaps
	// };
	// for insertion at the end of the grid only
	var lastElement = $(elements[(elements.length)-1]);
	console.log('lastElement is ' + lastElement.attr('class'));
	
	var randomImageArray = [];
	//random image maker
	// var randomImageMaker = function() {
	// 	if (remainder%1 !==0) //if the remainder is a fraction
	// 		{
	// 			//first insert a half tile
	// 			randomImageArray.push('<div style="display:inline-block; opacity:1" class="tile filler image-tile mix general_info all tile-1-wide tile-half-tall" data-height="0.5" data-width="1"><img src="img/random-2.jpg"></div>');
	// 			remainder -= 0.5;
	// 			//now recurse
	// 			randomImageMaker();
	// 		}
	// 	else {randomImageArray.push('<div style="display:inline-block; opacity:1" class="tile filler image-tile mix general_info all tile-' + remainder + '-wide" data-height="1" data-width="' + remainder + '"><img src="img/random-2.jpg"></div>');}
	// };
	// randomImageMaker();
	var currentElement = null;
	var currentRow = 1;
	var currentElementHeight = null;
	var sumHeight = 0;
	for (var i=0; i < tileNumber; i++) {
		currentElement = $(elements[i]); //get the current tile under inspection and wrap as jQuery object
		console.log('Current Element is ' + currentElement.attr('class'));
		if (sumHeight < n) {
			sumHeight += parseFloat(currentElement.attr('data-height'))*parseFloat(currentElement.attr('data-width')); //get height of tile from data-attribute, in row units
			console.log('sum of heights in this row is now ' + sumHeight);
		}
		else if (sumHeight%n === 0) { //if the total cell heights fill the row with no excess
			sumHeight = parseFloat(currentElement.attr('data-height')); //if the sum of heights is greater than the column number, reset sumHeight to start iterating over a new row, seeding with the first tile
			currentRow += 1;
			console.log('Moving on to row ' + currentRow);
		}
		else {

		}
		if (isInt(sumHeight)) {
			console.log('current tile fills the column, moving on.'); //if the sum of heights is an integer then do nothing
			
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