// Canvas size and scaling relative to screen size

var gameX = 1100;
var gameY = 800;
var canvas_x = window.innerWidth;
var canvas_y = window.innerHeight;
var scaleRatio = Math.min(canvas_x/gameX, canvas_y/gameY);

var game = new Phaser.Game(gameX*scaleRatio, gameY*scaleRatio, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update});

// setStyle(font = "Arial", update);

// Sound
var click;
var background;
var volume = 1; 
var youwin;
var muteBGM;
var mute2;

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
var winning = false;

//music found from https://www.dl-sounds.com/royalty-free/category/game-film/video-game/ && http://freesound.org
//https://tutorialzine.com/2015/06/making-your-first-html5-game-with-phaser source
//for the game over screen


// Various Screens
var gameDone;
var youWin
var logo;
var backgroundImage;
var help;

// For keeping tracking of turns
var moved = false;
var rotated = false;


// Constants to for the map 
var WIDTH = 3;
var LENGTH = 3;
var MEMORY_NUM = 2;
var COMBO_SPAWN = 0.2;


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


/*
    Phaser Functions
*/

function preload() {
    // Used to load the background music, game over and win sounds, and UI sounds
    game.load.audio('bgm', 'assets/sounds/PuzzleTheme1.wav');
    game.load.audio('click', 'assets/sounds/click1.wav');
    game.load.audio('restartClick', 'assets/sounds/219472__jarredgibb__button-01.wav');
    game.load.audio('win!', 'assets/sounds/win.mp3');
    game.load.audio('lose', 'assets/sounds/gameover.wav');

    // Buttons
    game.load.image('mute', 'assets/sprites/buttons/mute.png');
    game.load.image('mute2', 'assets/sprites/buttons/mute2.png');
    game.load.image('memoryBoard', 'assets/sprites/buttons/memory_board.jpg')
    game.load.image('replayImage',"assets/sprites/buttons/button_restart.png");
    game.load.image('instructions', "assets/sprites/buttons/instruction.png");
    game.load.image('credits', "assets/sprites/buttons/credits.png");
    game.load.image('help', "assets/sprites/buttons/help.png");

    // Used to load menu icons
    game.load.image('move', "assets/sprites/buttons/Move.png");
    game.load.image('rotateClock',"assets/sprites/buttons/Rotate_Clockwise.png");
    game.load.image('rotateCounter',"assets/sprites/buttons/Rotate_Counter_Clockwise.png");


    // Big Screens
    game.load.image('logo', 'assets/sprites/menus/welcome.jpg');
    game.load.image('gameover', 'assets/sprites/menus/gameover.png');
    game.load.image('youwin', 'assets/sprites/menus/youwin.png');
    game.load.image('background', 'assets/sprites/menus/background.jpg');
    game.load.image('helpScreen','assets/sprites/menus/help.jpg');
    game.load.image('creditPage', "assets/sprites/menus/credits.jpg");

    // Fonts    
    game.load.bitmapFont('zigFont', 'assets/zig/font/font.png','assets/zig/font/font.fnt');
    
    // The sprite for the player
    game.load.image('memoryTile', 'assets/sprites/characters/puzzle.png');
    game.load.image('player', "assets/sprites/characters/Player.png");
    game.load.image('guard', "assets/sprites/characters/Guard.png");
    

    // Used to load entrance/exit and restart button/instructions
    game.load.image('entrix',"assets/sprites/tiles/EntranceExit.png");
    

    // Used to load the images as sprites to randomly access
    for (var i = 0; i < tileNames.length; i++) {
        game.load.image('tile'+i, 'assets/sprites/tiles/' + tileNames[i]);
        tiles.push('tile'+i);
    }

    // same as above but for the combo tiles
    for (var m = 0; m < comboTileNames.length; m++) {
        game.load.image('combo'+m, 'assets/sprites/tiles/' + comboTileNames[m]);
        comboTiles.push('combo'+m);
    }
}

function create() {

    makeBackground();

    boardGenerator();

    makePlayer();

    makeMemoryTiles();

    memoryBoardGenerator();

    backgroundMusic();

    makeUI();

}

function backgroundMusic() {

    // Muting the BGM

    muteBGM = game.add.button(game.world.centerX+2.5*TILE_SIZE-10*scaleRatio, game.world.centerY+BOX_SIZE, 'mute');
    muteBGM.scale.setTo(BOX_SIZE/(2*muteBGM.width), BOX_SIZE/(2*muteBGM.height));
    muteBGM.anchor.setTo(1,0.5);
    muteBGM.inputEnabled = true;
    muteBGM.events.onInputDown.add(muteFunction,this);
    addHighlight(muteBGM);
    muteBGM.events.onInputUp.add(function() {muteBGM.tint = 0xffffff;}, this);

    // Muted button
    mute2 = game.add.button(game.world.centerX+2.5*TILE_SIZE-10*scaleRatio, game.world.centerY+BOX_SIZE, "mute2");
    mute2.scale.setTo(BOX_SIZE/(2*mute2.width), BOX_SIZE/(2*mute2.height));
    mute2.anchor.setTo(1,0.5);
    mute2.inputEnabled = true;
    mute2.events.onInputDown.add(muteFunction,this);
    addHighlight(mute2);
    mute2.events.onInputUp.add(function() {mute2.tint = 0xffffff;}, this);
    mute2.visible = false;

    

    background = game.add.audio('bgm', volume, true);
    background.play();
    

}

// Mute function for the BGM
function muteFunction() {
    if (volume) {
        background.stop();
        mute2.visible = true;
        mute2.bringToTop();
    } else {
        background.play();
        mute2.visible = false;
    }
    volume = !volume;
}

function makeBackground() {
    // Sets up the background
    game.stage.backgroundColor = "#44aaaa";
    game.scale.pageAlignHorizontally = true; game.scale.pageAlignVertically = true; game.scale.refresh();

    backgroundImage = game.add.image(game.world.centerX, game.world.centerY, 'background');
    backgroundImage.anchor.setTo(0.5, 0.5);
    backgroundImage.scale.setTo(gameX*scaleRatio/backgroundImage.width,gameY*scaleRatio/backgroundImage.height);
    backgroundImage.sendToBack();
    backgroundImage.tint = 0x151115;
}

function memoryBoardGenerator() {

    rectangle = game.add.sprite(game.world.centerX + 2.5*TILE_SIZE, game.world.centerY, "memoryBoard");
    rectangle.anchor.setTo(0.5,0.5);
    rectangle.scale.setTo(scaleRatio*0.1,scaleRatio*0.10);

    text = game.add.bitmapText(game.world.centerX + 2.5*TILE_SIZE, game.world.centerY, 'zigFont', "Memories: " + memoryAmount + "\n Steps: " + steps, 18);
    text.anchor.setTo(0.5, 0.5);
    text.scale.setTo(scaleRatio, scaleRatio);
    message = game.add.bitmapText(game.world.centerX - 0.375 * TILE_SIZE, game.world.centerY - 2*TILE_SIZE, 'zigFont', "Collect the memory pieces\nand move to the exit.", 12);
}


function update() {
    //backgroundChange();
    if (finished) {
        console.log("Here!");
        return;
    } else {
        finished = checkGameStatus();
    }
    
    if (rotated) {
        message.text = "YOU ROTATED. \nClick to move.";
    }
    if (moved) {
        message.text = "YOU MOVED. \nClick to rotate.";
    }   

    if (rotated && moved) {
        for(let n = 0; n < guards.length; n++) {
            if (!guards[n].active) {
                respawnGuard(n);
                guards[n].tint = 0xffffff;
                guards[n].active = true;
            } else {
                moveGuard(guards[n]);
            }
        }
        rotated = false;
        moved = false;
    }
    finished = checkGameStatus();
}



/* 
    Initializing Functions for the create function
*/
function boardGenerator() {
    // Creates the board
    board = [[],[],[]];
    for (let x = 0; x < WIDTH; x++) {
        

        for (let y = 0; y <= LENGTH + 1; y++) {
            // Finds the centered placement of the tiles 
            let s;
            
            // Sets up a random rotation for eachtile
            let rotation = Math.floor(Math.random()*DIRECTIONS)*RIGHT_ANGLE;
            if (x == 0 && y == 1) {
                rotation = 0; // Ignores the tile that is directly below the player at the start    
            }
            if (y == 0) {
                if (x == 0) {
                    //Creates the entrance
                    s = new BasicTile([0,0,1,0], 0, xLoc(x), yLoc(y), "entrix", x, y);
                    entrance = s;
                } else 
                    s = new BasicTile([0,0,0,0], 0, xLoc(x), yLoc(y), "", x, y);
            
            } else if (y == LENGTH + 1) {
                // Creates the exit
                if (x == WIDTH - 1) {
                    s = new BasicTile([0,0,1,0], FLIPPED, xLoc(x), yLoc(y), "entrix",x, y);
                    exit = s
                } else
                    s = new BasicTile([0,0,0,0], 0, xLoc(x), yLoc(y), "", x, y);

            } else if (Math.random() < COMBO_SPAWN) {
                let tileName = comboTiles[Math.floor(Math.random()*comboTiles.length)];
                s = new ComboTile(findComboExits(tileName), rotation, xLoc(x), yLoc(y), tileName, x, y);
            
            } else {
                // Creates the actual sprites and adds a handler to rotate it
                let tileName = tiles[Math.floor(Math.random()*tiles.length)];
                s = new BasicTile(findExits(tileName), rotation, xLoc(x), yLoc(y), tileName, x, y);
            }
            board[x][y] = s;
            s.image.scale.setTo(TILE_SIZE/s.image.width, TILE_SIZE/s.image.height);
        }
    }
}

function makePlayer() {

    // Creates the player
    player = game.add.sprite(xLoc(entrance.x), yLoc(entrance.y), 'player');
    player.pos = {x:entrance.x, y:entrance.y};
    player.anchor.setTo(0.5,0.5);
    player.inputEnabled = true;
    player.scale.setTo(playerSize/player.width,playerSize/player.height);

}

function makeUI() {

    //Creates the restart button
    restartButton = game.add.button(game.world.centerX + 2.5*TILE_SIZE, game.world.centerY-BOX_SIZE, 'replayImage', actionOnClick, this);
    restartButton.anchor.setTo(0.5,0.5);
    restartButton.scale.setTo(0.41*scaleRatio,0.41*scaleRatio);
    restartButton.inputEnabled = true;
    addHighlight(restartButton);
    restartButton.events.onInputUp.add(function() {restartButton.tint = 0xffffff;}, this);

    // Instructions Button
    instructions = game.add.button(game.world.centerX + 2.5*TILE_SIZE-10*scaleRatio, game.world.centerY+1.65*BOX_SIZE, 'instructions', actionOnClick2, this);
    instructions.scale.setTo(BOX_SIZE/(2*instructions.width),BOX_SIZE/(2*instructions.height));
    instructions.anchor.setTo(1,0.5);
    instructions.inputEnabled = true;
    addHighlight(instructions);
    instructions.events.onInputUp.add(function() {instructions.tint = 0xffffff;}, this);

    // Instructions Button
    help = game.add.button(game.world.centerX + 2.5*TILE_SIZE+10*scaleRatio, game.world.centerY+1.65*BOX_SIZE, 'help', helpClick, this);
    help.scale.setTo(BOX_SIZE/(2*help.width),BOX_SIZE/(2*help.height));
    help.anchor.setTo(0,0.5);
    help.inputEnabled = true;
    addHighlight(help);
    help.events.onInputUp.add(function() {help.tint = 0xffffff;}, this);
    
    // Credits button
    credits = game.add.button(game.world.centerX + 2.5*TILE_SIZE+10*scaleRatio, game.world.centerY+BOX_SIZE, 'credits', creditsClick, this);
    credits.scale.setTo(BOX_SIZE/(2*credits.width),BOX_SIZE/(2*credits.height));
    credits.anchor.setTo(0,0.5);
    credits.inputEnabled = true;
    addHighlight(credits);
    credits.events.onInputUp.add(function() {credits.tint = 0xffffff;}, this);

    //Credits Page
    creditPage = game.add.sprite(game.world.centerX, game.world.centerY, "creditPage");
    creditPage.anchor.setTo(0.5,0.5);
    creditPage.scale.setTo(gameX*scaleRatio/creditPage.width, gameY*scaleRatio/creditPage.height);
    creditPage.fixedtoCamera = true;
    creditPage.bringToTop();
    creditPage.visible = false;

    // Help page
    helpScreen = game.add.sprite(game.world.centerX, game.world.centerY, "helpScreen");
    helpScreen.anchor.setTo(0.5,0.5);
    helpScreen.scale.setTo(gameX*scaleRatio/helpScreen.width, gameY*scaleRatio/helpScreen.height);
    helpScreen.fixedtoCamera = true;
    helpScreen.bringToTop();
    helpScreen.visible = false;


    //Splash screen
    logo = game.add.sprite(game.world.centerX, game.world.centerY, "logo");
    logo.anchor.setTo(0.5,0.5);
    logo.scale.setTo(gameX*scaleRatio/logo.width, gameY*scaleRatio/logo.height);
    logo.fixedtoCamera = true;
    logo.bringToTop();
    game.input.onDown.add(removeLogo, this);

    // Game Over screen
    gameDone = game.add.sprite(game.world.centerX, game.world.centerY, 'gameover');
    gameDone.scale.setTo(1.2 * scaleRatio,1.2*scaleRatio);
    gameDone.anchor.setTo(0.5,0.5);
    gameDone.visible = false;

    // You Win! Screen
    youWin = game.add.sprite(-0.1*TILE_SIZE+game.world.centerX, game.world.centerY + 0.75*TILE_SIZE, 'youwin');
    youWin.scale.setTo(1.25*scaleRatio,1.5*scaleRatio);
    youWin.anchor.setTo(0.5,0.5);
    youWin.visible = false;
    youWin.inputEnabled = false;
}

function makeMemoryTiles() {

    // Make memory tiles
    posMemTilesLocs = [];
    
    for (let a = 0; a < WIDTH; a++) {
        for (let b = 1; b <= LENGTH; b++) {
            posMemTilesLocs.push({x:a,y:b});
        }
    }
    // Removes the chance that the tiles land adjacent to the player
    posMemTilesLocs.splice(LENGTH, 1);
    posMemTilesLocs.splice(1, 1);
    posMemTilesLocs.splice(0, 1);
    
    for (let i = 0; i < MEMORY_NUM; i++) {
        // Random indices on the board based on the locations
        let index = Math.floor(Math.random()*posMemTilesLocs.length);
        let coord = posMemTilesLocs[index];
        posMemTilesLocs.splice(index, 1)
        // Which translate to random locations
        let memoryTile = game.add.sprite(xLoc(coord.x), yLoc(coord.y), 'memoryTile');
        memoryTile.pos = {x: coord.x, y: coord.y};
        memoryTile.found = false;
        memoryTiles.push(memoryTile);
        memoryTile.anchor.setTo(0.5,0.5);
        memoryTile.scale.setTo(32*scaleRatio/memoryTile.width,32*scaleRatio/memoryTile.length);
        memoryTile.tint = Math.floor(Math.random()*0xffffff);
        makeGuard(coord.x, coord.y);    
    }

}

function makeGuard(xpos, ypos) {
    // Creates the Guard
    let guard = game.add.sprite(xLoc(xpos), yLoc(ypos), 'guard');
    guard.pos = {x: xpos, y: ypos};
    guard.anchor.setTo(0.5,0.5);
    guard.scale.setTo(playerSize/guard.width,playerSize/guard.width);
    guard.active = true;
    guards.push(guard);
    board[xpos][ypos].joinZone(guard);
}

/*
    UI Functions
*/

// Keeps track of memory tiles collected
function updateText() {
    text.setText("Memories: " + memoryAmount + "\n" + "Steps: " + steps);

}   

// Makes the buttons change color over various mouse inputs
function addHighlight(s) {
    s.events.onInputOver.add(highlights(s), this);
    s.events.onInputOut.add(normalize(s),this);
    s.events.onInputDown.add(color(s), this);
}

// the dark blue (pressed down)
function color(s) {
    return function() {
        click = game.add.audio('click', 0+volume);
        click.play();
        s.tint = 0x888888;
    }
}

// the light blue highlight
function highlights(s) {
    return function() {
        resetHighlight();
        if (s.tint == 0xffffff) {
            s.tint = 0xcccccc;
        }
    }
}

// Turns the hover tiles to normal
function normalize(s) {
    return function() {
        if (s.tint == 0xcccccc){ 
            s.tint = 0xffffff;
        }
    }
}

// Turns all highlight back to normal
function resetHighlight() {
    for (let x = 0;  x < board.length; x++) {
        for (let y = 0; y < board[x].length; y++) {
            if (board[x][y].image.tint == 0xcccccc) {
                board[x][y].image.tint = 0xffffff
            }
        }
    }
    muteBGM.tint = 0xffffff;
    restartButton.tint = 0xffffff;
    instructions.tint = 0xffffff;
}

// Turns all tiles back to normal color
function reset() {
    for (let x = 0;  x < board.length; x++) {
        for (let y = 0; y < board[x].length; y++) {
            board[x][y].image.tint = 0xffffff
        }
    }
}

// Creates the UI for the tiles
function menuCreate(s) {
    return function() {
        
        if (finished) {
            return;
        }

        var BUTTON_Y = game.world.centerY;
        var OFFSET = game.world.centerX-350*scaleRatio;


        if (group) {
            button1.destroy();
            button2.destroy();
            button3.destroy();
        }

        reset();

        group = game.add.group();

        button1 = game.make.button(OFFSET, BUTTON_Y+(BOX_SIZE+MARGIN), 'rotateClock' , clockwise, this, 20, 10, 0);
        button2 = game.make.button(OFFSET, BUTTON_Y, 'rotateCounter', counterClockWise, this, 20, 10, 0);
        button3 = game.make.button(OFFSET, BUTTON_Y-(BOX_SIZE+MARGIN), 'move', move, this, 20, 10, 0);
     
        button1.scale.setTo(scaleRatio,scaleRatio);
        button2.scale.setTo(scaleRatio,scaleRatio);
        button3.scale.setTo(scaleRatio,scaleRatio);

        button1.anchor.setTo(0.5,0.5);
        button2.anchor.setTo(0.5,0.5);
        button3.anchor.setTo(0.5,0.5);

        logo.bringToTop();
        creditPage.bringToTop();

        function clockwise() {
            if (!rotated) {
                rotated = s.rotateClockWise();
            }
            removeGroup();

        }
        function counterClockWise() {
            if (!rotated) {
                rotated = s.rotateCounterClockWise();
            }
            removeGroup();
        }
        function move() {
            // Makes the player only be able to move after rotating
            if (!moved && rotated) {
                moved = movePlayer(s);
            }
            removeGroup();
        }


        function removeGroup() {
            button1.destroy();
            button2.destroy();
            button3.destroy();
            reset();
            game.world.remove(group);

        }


        addHighlight(button1);
        addHighlight(button2);
        addHighlight(button3);

        group.add(button1);
        group.add(button2);  
        group.add(button3);
    }
}

// used with the splash screen
function removeLogo () {
    // game.input.onDown.remove(removeLogo, this);
    //tried to use this to fade in/fade out the welcome...
    // game.add.tween(sprite).to( { alpha: 1 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
    logo.visible = false;
    creditPage.visible = false;
    helpScreen.visible = false;
    instructions.inputEnabled = true;
    restartButton.inputEnabled = true;
    credits.inputEnabled = true;
    help.inputEnabled = true;
}


// used with the restart button
function actionOnClick () {

    finished = false;
    player.pos = {x:entrance.x, y:entrance.y};
    for (let n = 0; n < memoryTiles.length; n++) {
        respawnGuard(n);
        guards[n].active = true;
        guards[n].tint = 0xffffff;
    }
    for (let x = 0;  x < board.length; x++) {
        for (let y = 0; y < board[x].length; y++) {
            board[x][y].resetRotation();
        }
    }
    gameDone.visible = false;
    youWin.visible = false
    rotated = false;
    moved = false;
    steps = 0;
    memoryAmount = 0;
    positionCharacter(player);
    for (let n = 0; n < MEMORY_NUM; n++) {
        memoryTiles[n].found = false;
        memoryTiles[n].tint = Math.floor(Math.random()*(0xffffff));
    }

    click = game.add.audio('restartClick', volume);
    click.play();
    message.text = "Collect the memory pieces\nand move to the exit.";
    reset();
    updateText();
}

// used with the instructions button
function actionOnClick2 () {

    instructions.inputEnabled = false;
    logo.bringToTop();
    restartButton.inputEnabled = false;

    if (logo.visible == false) {
        logo.visible = true;
        logo.bringToTop();
    }
}

function creditsClick () {

    instructions.inputEnabled = false;
    creditPage.bringToTop();
    restartButton.inputEnabled = false;

    if (creditPage.visible == false) {
        creditPage.visible = true;
    }
    credits.inputEnabled = false;

}

function helpClick () {

    instructions.inputEnabled = false;
    credits.inputEnabled = false;
    restartButton.inputEnabled = false;
    helpScreen.bringToTop();


    if (helpScreen.visible == false) {
        helpScreen.visible = true;
    }

    help.inputEnabled = false;
}


// To make the whole game replay
function replay() {
    actionOnClick();
    for (let x = 0; x < WIDTH; x++) {
        for (let y = 0; y <= LENGTH + 1; y++) {    
            board[x][y].image.destroy();
            delete board[x][y];
        }
    }
    boardGenerator();
    for (let n = 0; n < MEMORY_NUM; n++) {
        memoryTiles[n].destroy();
        guards[n].destroy();
    }
    guards = [];
    memoryTiles = [];
    makeMemoryTiles();
    player.destroy();
    makePlayer();
    actionOnClick();
}

/*
    Functions related to the movement characters
*/

// Trys to move the player and returns true if it does false othewise
function movePlayer(tile) {
    let x = player.pos.x;
    let y = player.pos.y;
    let xMove = tile.x - x;
    let yMove = tile.y - y;
    let changed = false;
    if (xMove == 0) {
        if (yMove == 1 && tile.canGoNorth(player) && board[x][y].canGoSouth(player)) {            
            player.pos.y += yMove;
            changed = true;
            positionCharacter(player);
            player.y -= (TILE_SIZE/3-10*scaleRatio);
        }
        if (yMove == -1 && tile.canGoSouth(player) && board[x][y].canGoNorth(player)) {
            player.pos.y += yMove;
            changed = true;
            positionCharacter(player);
            player.y += (TILE_SIZE/3-10*scaleRatio);
        }
    }
    else if (yMove == 0) {
        if (xMove == 1 && tile.canGoWest(player) && board[x][y].canGoEast(player)) {
            player.pos.x += xMove;
            changed = true;
            positionCharacter(player);
            player.x -= (TILE_SIZE/3-10*scaleRatio);
        }
        if (xMove == -1 && tile.canGoEast(player) && board[x][y].canGoWest(player)) {
            player.pos.x += xMove;
            changed = true;
            positionCharacter(player);
            player.x += (TILE_SIZE/3-10*scaleRatio);
        }
    }
    if (changed) {
        board[x][y].moveAway(player);
        tile.moveTo(player, xMove, yMove);
        steps++;
        checkMemoryTiles();
        updateText();
    }
    
    return changed;
}

// The bodyguard AI
function moveGuard(guard) {
    if (finished) {
        return;
    }
    let possibleMoves = possibleMovements(guard);
    if (possibleMoves.length != 0) {
        let pickedMove = possibleMoves[Math.floor(Math.random()*possibleMoves.length)];
        board[guard.pos.x][guard.pos.y].moveAway(guard)
        guard.pos.x += pickedMove.x;
        guard.pos.y += pickedMove.y;
        positionCharacter(guard);
        guard.x -= pickedMove.x*(TILE_SIZE/3-10)*scaleRatio;
        guard.y -= pickedMove.y*(TILE_SIZE/3-10)*scaleRatio;
        pickedMove.tile.moveTo(guard, pickedMove.x, pickedMove.y);
    } else {
        guard.active = false;
        guard.tint = 0x444444;
    }
    
}

function possibleMovements(character){
    let possibleMoves = [];
    let x = character.pos.x;
    let y = character.pos.y;
    if (y < board[x].length-1) {
        if (board[x][y+1].canGoNorth(character) && board[x][y].canGoSouth(character)) {
            possibleMoves.push({x:0,y:1, tile: board[x][y+1]});
        }
    }
    if (y > 0) {
        if (board[x][y-1].canGoSouth(character) && board[x][y].canGoNorth(character)) {
            possibleMoves.push({x:0,y:-1, tile: board[x][y-1]});
        }
    }
    if (x < board.length-1) {
        if (board[x+1][y].canGoWest(character) && board[x][y].canGoEast(character)) {
            possibleMoves.push({x:1,y:0, tile: board[x+1][ y]});
        }
    }
    if (x > 0) {
        if (board[x-1][y].canGoEast(character) && board[x][y].canGoWest(character)) {
            possibleMoves.push({x:-1,y:0, tile: board[x-1][y]});
        }
    }
    return possibleMoves;
}


/*
    Classes used for the tiles
*/

class BasicTile {

    // exits : represent as an array of length 4
    //          North: Index 0,
    //          West:  Index 1,
    //          South: Index 2,
    //          East:  Index 3,
    //          With Value 1 at the index meaning there is an exit
    //               Value 0 meaning there isn't
    // rotation: keeps track of the rotation of the tile and is between 0 <= x <= 360

    constructor(exits, rotation, xLoc, yLoc, tileName, x, y) {
        this.x = x;
        this.y = y;
        // Only creates image for tiles with sprites
        this.image = game.add.sprite(xLoc, yLoc, tileName);
        if (tileName != "") {
            this.image.anchor.setTo(0.5,0.5);
            this.image.inputEnabled = true;
            this.image.events.onInputDown.add(menuCreate(this), this);
            this.image.angle = rotation;
            addHighlight(this.image);
        }
        this.exits = exits;
        this.rotation = rotation;
        this.initialRotation = rotation;
    }
    canGoNorth (character) {
        return this.exits[(NORTH+(this.rotation/RIGHT_ANGLE)) % DIRECTIONS];
    }
    canGoWest (character) {
        return this.exits[(WEST+(this.rotation/RIGHT_ANGLE)) % DIRECTIONS];
    }
    canGoSouth (character) {
        return this.exits[(SOUTH+(this.rotation/RIGHT_ANGLE)) % DIRECTIONS];
    }
    canGoEast (character) {
        return this.exits[(EAST+(this.rotation/RIGHT_ANGLE)) % DIRECTIONS];
    }
    rotateClockWise() {
        // Escape for exit/entrance
        if (this.y == 0 || this.y == LENGTH+1) {
            return false;
        }
        if (player.pos.x == this.x && player.pos.y == this.y) {
            this.rotateCharacter(player, [{x:0, y:-1},{x:1, y:0},{x:0, y: 1},{x:-1, y:0} ]);
        }
        for (var i = 0; i < MEMORY_NUM; i++) {
            if (guards[i].pos.x == this.x && guards[i].pos.y == this.y) {
                this.rotateCharacter(guards[i], [{x:0, y:-1},{x:1, y:0},{x:0, y: 1},{x:-1, y:0} ]);
            }
        }

        this.rotation = (this.rotation + RIGHT_ANGLE) % FULL_CIRCLE;
        this.image.angle += RIGHT_ANGLE;
        return true;
        
        
    }
    rotateCounterClockWise() {
        // Escape for exit/entrance
        if (this.y == 0 || this.y == LENGTH+1) {
            return false;
        }
        if (player.pos.x == this.x && player.pos.y == this.y) {
            this.rotateCharacter(player, [{x:0, y:1},{x:1, y:0},{x:0, y:-1},{x:-1, y:0}]);
        }
        for (var i = 0; i < MEMORY_NUM; i++) {
            if (guards[i].pos.x == this.x && guards[i].pos.y == this.y) {   
                this.rotateCharacter(guards[i],  [{x:0, y:1},{x:1, y:0},{x:0, y:-1},{x:-1, y:0}]);
            }
        }
        this.rotation = (this.rotation - RIGHT_ANGLE + FULL_CIRCLE) % FULL_CIRCLE;
        this.image.angle -= RIGHT_ANGLE;
        return true;
    }
    rotateCharacter(character, circle){
        let deltaX = (xLoc(character.pos.x)-character.x)/(TILE_SIZE/3-10*scaleRatio);
        let deltaY = (yLoc(character.pos.y)-character.y)/(TILE_SIZE/3-10*scaleRatio);

        console.log(deltaX, deltaY);
        // Normalize fp math
        deltaX = Math.round(deltaX); 
        deltaY = Math.round(deltaY);
        console.log(deltaX, deltaY);
        // Find matching index
        var index = -1;
        for (var i = 0; i < circle.length; i ++) {
            if (circle[i].x == deltaX && circle[i].y == deltaY) {
                break;
            }
        }
        positionCharacter(character);
        character.x -= circle[(i+1) % circle.length].x*(TILE_SIZE/3-10*scaleRatio);
        character.y -= circle[(i+1) % circle.length].y*(TILE_SIZE/3-10*scaleRatio);
    }
    moveTo(character, x, y) {
        return;
    }
    moveAway(character) {
        return;
    }
    sameZone(player, guard) {
        return true;
    }
    joinZone(character) {
        return;
    }
    resetRotation() {
        this.image.angle = this.initialRotation;
        this.rotation = this.initialRotation
    }
}

class ComboTile {

    // Specifically represents a tile with two separate zones
    // exits : represent as an array of length 4
    //          North: Index 0,
    //          West:  Index 1,
    //          South: Index 2,
    //          East:  Index 3,
    //          With Value 2 at the index meaning there is an exit for zone 2
    //               Value 1 at the index meaning there is an exit for zone 1
    //               Value 0 meaning there isn't
    // rotation: keeps track of the rotation of the tile and is between 0 <= x <= 360

    constructor(exits, rotation, xLoc, yLoc, tileName, x, y) {
        this.zone1 = []
        this.zone2 = []
        this.x = x;
        this.y = y;
        // Only creates image for tiles with sprites
        this.image = game.add.sprite(xLoc, yLoc, tileName);
        if (tileName != "") {
            
            this.image.anchor.setTo(0.5,0.5);
            this.image.inputEnabled = true;
            this.image.events.onInputDown.add(menuCreate(this), this);
            this.image.angle = rotation;
            addHighlight(this.image);
        }
        this.exits = exits;
        this.rotation = rotation;
        this.initialRotation = rotation;
    }
    canGoDirection(character, direction) {
        let isExit = this.exits[(direction+(this.rotation/RIGHT_ANGLE)) % 4]
        if (isExit == 0) {
            return false;
        } else if (character.pos.x == this.x && character.pos.y == this.y) {
            
            if (this.zone1.includes(character)) {
                return isExit == 1; // Should only return 1 when is Exit is 1
            } else if (this.zone2.includes(character)){
                return isExit == 2; // Should only return 1 when is Exit is 2
            } else {
                console.log("Error: Character is not in any zone");
            }
        } else {
            return isExit != 0; // Any exit is good when you're entering
        }
    }
    canGoNorth (character) {
        return this.canGoDirection(character, NORTH);
    }
    canGoWest (character) {
        return this.canGoDirection(character, WEST);
    }
    canGoSouth (character) {
        return this.canGoDirection(character, SOUTH);
    }
    canGoEast (character) {
        return this.canGoDirection(character, EAST);
    }
    rotateClockWise() {
        // Escape for exit/entrance
        
        if (this.y == 0 || this.y == LENGTH+1) {
            return false;
        }

        if (player.pos.x == this.x && player.pos.y == this.y) {
            this.rotateCharacter(player, [{x:0, y:-1},{x:1, y:0},{x:0, y: 1},{x:-1, y:0} ]);
        }
        for (var i = 0; i < MEMORY_NUM; i++) {
            if (guards[i].pos.x == this.x && guards[i].pos.y == this.y) {
                this.rotateCharacter(guards[i], [{x:0, y:-1},{x:1, y:0},{x:0, y: 1},{x:-1, y:0} ]);
            }
        }
        this.rotation = (this.rotation + RIGHT_ANGLE) % FULL_CIRCLE;
        this.image.angle += RIGHT_ANGLE;
        return true;
        
    }
    
    rotateCounterClockWise() {
        // Escape for exit/entrance
        if (this.y == 0 || this.y == LENGTH+1) {
            return false;
        }
        if (player.pos.x == this.x && player.pos.y == this.y) {
            this.rotateCharacter(player, [{x:0, y:1},{x:1, y:0},{x:0, y:-1},{x:-1, y:0}]);
        }
        for (var i = 0; i < MEMORY_NUM; i++) {
            if (guards[i].pos.x == this.x && guards[i].pos.y == this.y) {   
                this.rotateCharacter(guards[i],  [{x:0, y:1},{x:1, y:0},{x:0, y:-1},{x:-1, y:0}]);
            }
        }
        this.rotation = (this.rotation - RIGHT_ANGLE + FULL_CIRCLE) % FULL_CIRCLE;
        this.image.angle -= RIGHT_ANGLE;
        return true;
    }
    rotateCharacter(character, circle){
        let deltaX = (xLoc(character.pos.x)-character.x)/(TILE_SIZE/3-10*scaleRatio);
        let deltaY = (yLoc(character.pos.y)-character.y)/(TILE_SIZE/3-10*scaleRatio);

        console.log(deltaX, deltaY);
        // Normalize fp math
        deltaX = Math.round(deltaX); 
        deltaY = Math.round(deltaY);
        console.log(deltaX, deltaY);
        // Find matching index
        var index = -1;
        for (var i = 0; i < circle.length; i ++) {
            if (circle[i].x == deltaX && circle[i].y == deltaY) {
                break;
            }
        }
        positionCharacter(character);
        character.x -= circle[(i+1) % circle.length].x*(TILE_SIZE/3-10*scaleRatio);
        character.y -= circle[(i+1) % circle.length].y*(TILE_SIZE/3-10*scaleRatio);
    }
    moveTo(character, x, y) {
         if (x == 0 && y == 1) { //Went to North Side
            if (this.exits[(NORTH+(this.rotation/RIGHT_ANGLE)) % DIRECTIONS] == 1) {
                this.zone1.push(character);
            } else {
                this.zone2.push(character);
            }
        } else if (x == 1 && y == 0) { //Moved West
            if (this.exits[(WEST+(this.rotation/RIGHT_ANGLE)) % DIRECTIONS] == 1) {
                this.zone1.push(character);
            } else {
                this.zone2.push(character);
            }
         } else if (x == 0 && y == -1) { //Went to South
            if (this.exits[(SOUTH+(this.rotation/RIGHT_ANGLE)) % DIRECTIONS] == 1) {
                this.zone1.push(character);
            } else {
                this.zone2.push(character);
            }
        } else if (x == -1 && y == 0) {//Moved East
            if (this.exits[(EAST+(this.rotation/RIGHT_ANGLE)) % DIRECTIONS] == 1) {
                this.zone1.push(character);
            } else {
                this.zone2.push(character);
            }

        } else {
            console.log("Error, Player moved too much");
        }

    }
    moveAway(character) {
        if (this.zone1.includes(character)) {
            this.zone1.splice(this.zone1.indexOf(character), 1);
        }
        else {
            this.zone2.splice(this.zone2.indexOf(character), 1);
        }
    }
    sameZone(player, guard) {
        return this.zone1.includes(player) == this.zone1.includes(guard) ||
               this.zone2.includes(player) == this.zone2.includes(guard);
    }
    joinZone(character) {
        if (character.zone) {
            if (character.zone == 1) {
                this.zone1.push(character);
            } else {
                this.zone2.push(character);

            }
        }
        else if (Math.random > 0.5) {
            this.zone1.push(character);
            character.zone = 1;
        } else {
            this.zone2.push(character);
            character.zone = 2;
        }
        positionCharacter(character);
        this.reposition(character);
    }

    reposition(character) {
        console.log("Repositioning");
        console.log(character.x, character.y);
        if (this.canGoNorth(character)) {
            character.y -= TILE_SIZE/3-10*scaleRatio;
            console.log("NORTH");
        } else if (this.canGoSouth(character)) {
            character.y += TILE_SIZE/3-10*scaleRatio;
            console.log("SOUTH");
        } else if (this.canGoWest(character)) {
            character.x -= TILE_SIZE/3-10*scaleRatio;
            console.log("WEST");
        } else if (this.canGoEast(character)) {
            character.x += TILE_SIZE/3-10*scaleRatio;
            console.log("EAST");
        } else {
            print("Error: Guard was not able to be positioned");
        }
        console.log(character.x, character.y);
    }
    resetRotation() {
        this.image.angle = this.initialRotation;
        this.rotation = this.initialRotation
    }
}


/*
    Helper functions to shorten code/ make it readable
*/
// Both return the coordinate value for the board index values
function xLoc(x) {
    return game.world.centerX+(x-1)*(TILE_SIZE);
}

function yLoc(y) {
    return game.world.centerY+(y-2)*(TILE_SIZE);
}

// positions character on the screen
function positionCharacter(character) {
    character.x = xLoc(character.pos.x);
    character.y = yLoc(character.pos.y);
}

// Finds the exits for the various tiles
function findExits(tileName) {
    // 4 being the length of the word tile
    let index = tileName.slice("tile".length, tileName.length);
    switch(tileNames[index]) {
        case "Corner_Tile.png":
            return [1,1,0,0];
        case "Cross_Tile.png":
            return [1,1,1,1];
        case "DeadEnd_Tile.png":
            return [1,0,0,0];
        case "Line_Tile.png":
            return [1,0,1,0];
        case "Tetris_Tile.png":
            return [1,1,1,0];
        default:
            return [0,0,0,0];
    }

}

// Finds the exits for the various combotiles
function findComboExits(tileName) {
    // 4 being the length of the word tile
    let index = tileName.slice("combo".length, tileName.length);
    switch(comboTileNames[index]) {
        case "Dead_End_2.png":
            return [1,0,2,0];
        case "Line_Combo.png":
            return [1,2,1,2];
        case "Loop_Tile_2.png":
            return [1,2,2,1];
        default:
            return [0,0,0,0];
    }

}

// Used to check if the player has won or lost
function checkGameStatus() {
        
    for (var n = 0;  n < guards.length; n++) {
        let guard = guards[n];

        if (player.pos.x == guard.pos.x && player.pos.y == guard.pos.y 
            && board[guard.pos.x][guard.pos.y].sameZone(player, guard)) {
            youlose = game.add.audio('lose', volume, false);
            youlose.play();
            gameDone.visible = true;
            gameDone.bringToTop(); 
            message.text = "You lost!\nPress the reset button\nto start again.";
            return true;

        } else if (player.pos.x == exit.x && player.pos.y == exit.y && memoryAmount == MEMORY_NUM) {
            // if its played at update, it's gonna keep playing it.... causing a bug :/
            COMBO_SPAWN = Math.min(COMBO_SPAWN+0.2, 0.6);
            youwin = game.add.audio('win!',volume, false);
            youwin.play();
            message.text = "YAY";
            youWin.visible = true;
            youWin.bringToTop();
            youWin.inputEnabled = true;
            youWin.events.onInputDown.add(replay,this);
            winning = true;
            return true;
        }
    }
    if (possibleMovements(player).length == 0) {
        youlose = game.add.audio('lose', volume, false);
        youlose.play();
        gameDone.visible = true;
        gameDone.bringToTop(); 
        message.text = "You lost!\nPress the reset button\nto start again.";
        return true;
    }
    return false;
}

// Checks if the player has reached a memory tile
function checkMemoryTiles() {
    for (let n = 0; n < MEMORY_NUM; n++) {
        let x = memoryTiles[n].pos.x;
        let y = memoryTiles[n].pos.y;
        let found = memoryTiles[n].found;
        if (player.pos.x == x && player.pos.y == y && !found) {
            memoryAmount++;
            memoryTiles[n].found = true;
            memoryTiles[n].tint = 0x444444;
            updateText();
        }
    }
}

// Respawns the guard in their corresponding memory tile
function respawnGuard(n) {
    let xpos = memoryTiles[n].pos.x;
    let ypos = memoryTiles[n].pos.y;
    guards[n].pos = {x: xpos, y: ypos};
    positionCharacter(guards[n]);
    board[xpos][ypos].joinZone(guards[n]);
}

function rgbToHex(r, g, b) {
    return r*Math.pow(16,4)+g*Math.pow(16,2)+b;

}
function hexToRGB(hex) {
    return { r: (hex >> 16) % 256,
             g: (hex >> 8) % 256,
             b: hex % 256 }
}
var count = 0;
function backgroundChange() {
    if (!(count % 10)) {
        color = hexToRGB(backgroundImage.tint);
        //console.log(color);
        newR = 0x22*count/10;
        newG = 0x00*count/10;
        newB = 0x22*count/10;
        //console.log(newR, newG, newB);
        backgroundImage.tint = rgbToHex(newR, newG, newB);
    }
    count++;
}