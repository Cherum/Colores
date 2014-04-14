//Initialize function
var init = function () {
    // TODO:: Do your initialization job
    console.log("init() called");

    // add eventListener for tizenhwkey
    document.addEventListener('tizenhwkey', function(e) {
        if(e.keyName == "back")
            tizen.application.getCurrentApplication().exit();
    });
};
$(document).bind('pageinit', init);

var io;
var grid;

var blockSize;

var width = 720;
var height = 1280;

var border = 10;
var topBorder = 150;

var num_width = 14;
var num_height = 17;

var colors = ["#bc0d0d", "#0cb142", "#0dbcb6", "#e8880b", "#f0ff00", "#333c9a"];

var buttonSize = 100;
var buttons = [];

var checkedFields;

var moves = 0;
var movesText = "";

function initGrid(io){
	this.io = io;
	
	io.setBGColor('#cbd4af');

	
	//Create Grid
	var maxWidthHeight = (num_width < num_height) ? num_width : num_height;
    var blockSizeX = Math.round((width-2*border)/maxWidthHeight);
    
    var maxHeight = height - topBorder*2 - buttonSize*2;
    var blockSizeY = Math.round((maxHeight-2*border)/maxWidthHeight);
    
    blockSize = (blockSizeX < blockSizeY) ? blockSizeX : blockSizeY;
    

   	//New Constructor added in Github distrib
    grid = io.addObj(new iio.Grid(border, topBorder, num_width, num_height, blockSize));
   	
    grid.setStrokeStyle('white');
    grid.draw(io.context);
    
    io.addGroup('foreground', 10);
    var logo = new iio.SimpleRect(new iio.Vec(720/2, topBorder/2)).createWithImage("./img/logo.png").setImgSize('native');
	io.addToGroup('foreground', logo);
    
    resetCheckedFields();
    
    createButtons();
    addTouch();
    
    fillWithRandom();
    
    moves = num_width+num_height+1;
    addString();
    
    io.setFramerate(60, function(){
		io.canvas.draw(io.context);
    });
}
//
function addTouch(){
	var touchable = document.getElementById("c_body");
	
	touchable.addEventListener("touchstart", function(e){
		var x = e.touches.item(0).screenX;
		var y = e.touches.item(0).screenY;
		
		handleTouch(x, y);
	}, false);
	
	io.canvas.addEventListener('mousedown', function(event) {
    	var x = event.x;
    	var y = event.y;
    	
    	handleTouch(x, y);
	});
}
//
function handleTouch(x, y){
	for(var i=0; i < buttons.length; i++){
		if((buttons[i].pos.x-buttonSize/2) <= x && x <= (buttons[i].pos.x+buttonSize/2) && (buttons[i].pos.y-buttonSize/2) <= y && y <= (buttons[i].pos.y+buttonSize/2) ){
			var newColor = buttons[i].type;
			var oldColor = grid.cells[0][0].type;
			
			if(newColor !== oldColor){
				grid.cells[0][0].type = newColor.slice(0);
		    	grid.cells[0][0].square.setFillStyle(newColor);
			    	
				changeToColor(newColor, oldColor, 0, 0);
				io.canvas.draw(io.context);
				resetCheckedFields();
				
				moves--;
				refreshString();
				
				checkWonLost();
			}
			
			break;
		}
	}
	
	var resetStartY = height - buttonSize*2 - 20;
	if(20 <= x && x <= 100 && resetStartY-40 <= y && y <= resetStartY+40){
		fillWithRandom();
		moves = num_width+num_height+1;
		refreshString();
	}
}
//
function changeToColor(newColor, oldColor, x, y){
//	console.log("changeToColor "+x+" / "+y+" | "+newColor+" / "+oldColor);
	
	checkedFields[x][y] = true;
    if((x+1) < grid.C && checkedFields[x+1][y] === false && grid.cells[x+1][y].type == oldColor){
        grid.cells[x+1][y].type = newColor.slice(0);
    	grid.cells[x+1][y].square.setFillStyle(newColor);
    	
    	changeToColor(newColor, oldColor, x+1, y);
    }
    if((y+1) < grid.R && checkedFields[x][y+1] === false && grid.cells[x][y+1].type == oldColor){
        grid.cells[x][y+1].type = newColor.slice(0);
    	grid.cells[x][y+1].square.setFillStyle(newColor);
    	
    	changeToColor(newColor, oldColor, x, y+1);
    }
    if((y-1) >= 0 && checkedFields[x][y-1] === false && grid.cells[x][y-1].type == oldColor){
        grid.cells[x][y-1].type = newColor.slice(0);
    	grid.cells[x][y-1].square.setFillStyle(newColor);
    	
    	changeToColor(newColor, oldColor, x, y-1);
    }
    if((x-1) >= 0 && checkedFields[x-1][y] === false && grid.cells[x-1][y].type == oldColor){
        grid.cells[x-1][y].type = newColor.slice(0);
    	grid.cells[x-1][y].square.setFillStyle(newColor);
    	
    	changeToColor(newColor, oldColor, x-1, y);
    }
    return;
}
//
function createSquare(y, x, color){
	grid.cells[x][y].type = color;
	
	grid.cells[x][y].square = io.addObj(new iio.SimpleRect(grid.getCellCenter(x,y),blockSize).setFillStyle(color));
}
// 
function createButtons(){
	var buttonMargin = 20;
	
	var bottomPosY = height - buttonMargin*2 - buttonSize;
	var bottomPosX = buttonMargin*2;
	
	for(var i=0; i < colors.length; i++){
		var but = io.addObj(new iio.SimpleRect(new iio.Vec(bottomPosX + blockSize/2 + i*(buttonSize + buttonMargin), bottomPosY+blockSize/2), buttonSize).setFillStyle(colors[i]));
		but.type = colors[i];
		buttons.push(but);
	}
	
	var logo = new iio.SimpleRect(new iio.Vec(60, height - buttonSize*2 - 20)).createWithImage("./img/reload_scaled.png").setImgSize('native');
	io.addToGroup('foreground', logo);
}
//
function fillWithRandom(){
//	console.log("fillWithRandom");
	for(var i=0; i < grid.R; i++){
		for(var j=0; j < grid.C; j++){
			var color = colors[Math.floor(Math.random() * colors.length)];
			
			createSquare(i, j, color);
		}
	}
}
//
function resetCheckedFields(){
    // create 2d array
    checkedFields = new Array(num_width);
    for (var i = 0; i < num_width; i++) {
    	checkedFields[i] = new Array(num_height);
    	for(var j = 0; j < num_height; j++){
    		checkedFields[i][j] = false;
    	}
    }
}
//
function addString(){
	movesText = new iio.Text("You have "+moves+" Moves left", new iio.Vec(710, height - buttonSize*2 - 10)).setFillStyle('black').setTextAlign('right').setFont('40px Consolas');
	io.addToGroup('foreground', movesText);
}
//
function refreshString(){
	movesText.text = "You have "+moves+" Moves left";
}
//
function checkWonLost(){
	if(moves < 0){
		movesText.text = 'You lost! Oh noes!';
	}
	else {
		var color = grid.cells[0][0].type;
		
		if(grid.cells[0][grid.R-1].type !== color){
			return;
		}
		else if(grid.cells[grid.C-1][0].type !== color){
			return;
		}
		else if(grid.cells[grid.C-1][grid.R-1].type !== color){
			return;
		}
		else {
			for(var i=0; i < grid.R; i++){
				for(var j=0; j < grid.C; j++){
					if(grid.cells[j][i].type !== color){
						return;
					}
				}
			}
		}
		
		movesText.text = 'You won! Hooray!';
		moves = 99999;
	}
}