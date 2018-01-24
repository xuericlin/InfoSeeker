var gameX = 800;
var gameY = 800;
var canvas_x = window.innerWidth;
var canvas_y = window.innerHeight;
var scaleRatio = Math.min(canvas_x/gameX, canvas_y/gameY);

var game = new Phaser.Game(gameX*scaleRatio, gameY*scaleRatio, Phaser.CANVAS);

// setStyle(font = "Arial", update);

// Sound
var click;
var background;
var volume = 1; 
var youwin;
var muteBGM;
var mute2;
var animateCount = 0;

// Map related Variables
var board;
var entrance;
var exit;


// Characters on the screen
var player;
var guards = [];
var memoryTiles = [];


// Menu Variable
var message; // To tell the person that they have moved/rotated
var text; // this text is for the memory tiles text
var memoryTaken;
var rectangle;
var memoryAmount = 0; //starts off with the amount of tiles collected
var steps = 0;
var finished = false;
var score = 0;
var scoreHolder = 0;

//music found from https://www.dl-sounds.com/royalty-free/category/game-film/video-game/ && http://freesound.org
//https://tutorialzine.com/2015/06/making-your-first-html5-game-with-phaser source
//for the game over screen


// Various Screens
var gameDone;
var youWin
var logo;
var backgroundImage;
var replayButton;

// For keeping tracking of turns
var moved = false;
var rotated = false;


// Constants to for the map 
var WIDTH = 3;
var LENGTH = 3;
var MEMORY_NUM = 2;
var COMBO_SPAWN = 0.5;
var DEADEND_LIMIT = 1;
var CROSS_LIMIT = 2;

// Constants for checking directions
var RIGHT_ANGLE = 90;
var FLIPPED = 180;
var FULL_CIRCLE = 360;
var CHAR_OFFSET = TILE_SIZE/3-(10*scaleRatio);


// Filenames
var tiles = [];
var comboTiles = [];
var entrix = "EntranceExit.png";
var replayImage = "button_restart.png";
var comboTileNames = ["Dead_End_2.png","Line_Combo.png","Loop_Tile_2.png"];
var tileNames = ["Corner_Tile.png","Cross_Tile.png","DeadEnd_Tile.png", "Line_Tile.png","Tetris_Tile.png"];
var instructions;

// UI variables
var button1;
var button2;
var button3;
var group;
var cursorPos = {x:-1, y:-1};
var credits;
var creditPage;


// UI Constants
var TILE_SIZE = 160*scaleRatio;
var MARGIN = 12*scaleRatio;
var BOX_SIZE = 128*scaleRatio; 
var playerSize = 40*scaleRatio;



// Keys 
var keyUp;
var keyLeft;
var keyDown;
var keyRight;
var keyZ;
var keyX;


// Directions
var NORTH = 0;
var WEST = 1;
var SOUTH = 2;
var EAST = 3;
var DIRECTIONS = 4;

game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('main', mainState);
game.state.add('setup',setupState);

//game.input.mouse.enabled = !game.device.mspointer;

game.state.start('boot');