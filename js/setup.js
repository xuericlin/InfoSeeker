var setupState = {
    create: function() {
        console.log("Setup Beginning");
        game.state.start('menu');
    }
};


function backgroundMusic() {
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

// also the score
function memoryBoardGenerator() {

    let offset = 10*scaleRatio;
    let menu_Y = game.world.centerY-BOX_SIZE/2;
    let menu_X = game.world.centerX+1.75*TILE_SIZE;

    rectangle = game.add.sprite(menu_X,  menu_Y+offset, "memoryBoard");
    rectangle.anchor.setTo(0.5,0.5);
    rectangle.scale.setTo(scaleRatio*0.10,scaleRatio*0.10);

    text = game.add.bitmapText(menu_X,  menu_Y, 'zigFont', "Info: " + memoryAmount + "\nSteps: " + steps, 18);
    text.anchor.setTo(0.5, 0);
    text.scale.setTo(scaleRatio, scaleRatio);

    scoreText = game.add.bitmapText(menu_X, menu_Y, 'zigFont', "Score: " + "0" , 20);
    scoreText.anchor.setTo(0.5,1);
    scoreText.tint = 0x99f0f9;    

    let message_X = game.world.centerX+6*offset;
    let message_Y = game.world.centerY - 2*TILE_SIZE-offset;

    
    messageRectangle = game.add.sprite(message_X,  message_Y+offset, "memoryBoard");
    messageRectangle.anchor.setTo(0.5,0.5);
    messageRectangle.scale.setTo(scaleRatio*0.22,scaleRatio*0.10);

    message = game.add.bitmapText(message_X, message_Y, 'zigFont', "Collect info pieces\nand reach the exit.", 18);
    message.anchor.setTo(0.5,0.5);
    message.tint = 0xefdf40;
    
}


/* 
    Initializing Functions for the create function
*/
function boardGenerator() {
    // Creates the board
    let tiles_copy = tiles.slice();
    let deadendCount = 0;
    let crossCount = 0;
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
                let tileName = tiles_copy[Math.floor(Math.random()*tiles_copy.length)];
                s = new BasicTile(findExits(tileName), rotation, xLoc(x), yLoc(y), tileName, x, y);

                // Limit the number of deadends and crosses
                let index = tileName.slice("tile".length, tileName.length);
                if (tileNames[index] == "Cross_Tile.png") {
                    crossCount++;
                    if (crossCount == CROSS_LIMIT) {
                        tiles_copy.splice(index, 1);
                    }
                } else if (tileNames[index] == "DeadEnd_Tile.png") {
                    deadendCount++;
                    if (deadendCount == DEADEND_LIMIT) {
                        tiles_copy.splice(index, 1);
                    }
                }



            }
            board[x][y] = s;
            s.image.scale.setTo(TILE_SIZE/s.image.width, TILE_SIZE/s.image.height);
        }
    }
}

function makePlayer() {

    // Creates the player
    player = game.add.sprite(xLoc(entrance.x), yLoc(entrance.y), 'player');
    player.frame = 0;
    player.pos = {x:entrance.x, y:entrance.y};
    player.anchor.setTo(0.5,0.5);
    player.inputEnabled = true;
    player.scale.setTo(playerSize/player.width,playerSize/player.height);

}

function makeUI() {
    let offset = 10*scaleRatio;
    let menu_Y = game.world.centerY-BOX_SIZE/2;
    let menu_X = game.world.centerX+1.75*TILE_SIZE;
     // Muting the BGM
    muteBGM = game.add.button(menu_X-offset, menu_Y+BOX_SIZE , 'buttons');
    muteBGM.frame = 2;
    muteBGM.scale.setTo(BOX_SIZE/(2*muteBGM.width), BOX_SIZE/(2*muteBGM.height));
    muteBGM.anchor.setTo(1,0.5);
    muteBGM.inputEnabled = true;
    muteBGM.events.onInputDown.add(muteFunction,this);
    addHighlight(muteBGM);
    muteBGM.events.onInputUp.add(function() {muteBGM.tint = 0xffffff;}, this);

    // Muted button
    mute2 = game.add.button(menu_X-offset,menu_Y+BOX_SIZE, 'buttons');
    mute2.frame = 1;
    mute2.scale.setTo(BOX_SIZE/(2*mute2.width), BOX_SIZE/(2*mute2.height));
    mute2.anchor.setTo(1,0.5);
    mute2.inputEnabled = true;
    mute2.events.onInputDown.add(muteFunction,this);
    addHighlight(mute2);
    mute2.events.onInputUp.add(function() {mute2.tint = 0xffffff;}, this);
    mute2.visible = false;

    //Creates the reset button
    restartButton = game.add.button(menu_X, menu_Y-BOX_SIZE, 'replayImage', actionOnClick, this);
    restartButton.anchor.setTo(0.5,0.5);
    restartButton.scale.setTo(0.41*scaleRatio,0.41*scaleRatio);
    restartButton.inputEnabled = true;
    addHighlight(restartButton);
    restartButton.events.onInputUp.add(function() {restartButton.tint = 0xffffff;}, this);

    // Instructions Button
    instructions = game.add.button(menu_X-offset, menu_Y+1.65*BOX_SIZE, 'buttons', actionOnClick2, this);
    instructions.frame = 3;
    instructions.scale.setTo(BOX_SIZE/(2*instructions.width),BOX_SIZE/(2*instructions.height));
    instructions.anchor.setTo(1,0.5);
    instructions.inputEnabled = true;
    addHighlight(instructions);
    instructions.events.onInputUp.add(function() {instructions.tint = 0xffffff;}, this);

    // Make a new level Button
    replayButton = game.add.button(menu_X+offset, menu_Y+1.65*BOX_SIZE, 'buttons', replay, this);
    replayButton.scale.setTo(BOX_SIZE/(2*replayButton.width),BOX_SIZE/(2*replayButton.height));
    replayButton.anchor.setTo(0,0.5);
    replayButton.inputEnabled = true;
    addHighlight(replayButton);
    replayButton.events.onInputUp.add(function() {replayButton.tint = 0xffffff;}, this);
    
    // Credits button
    credits = game.add.button(menu_X+offset, menu_Y+BOX_SIZE, 'buttons', creditsClick, this);
    credits.frame = 4;
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
        memoryTile.scale.setTo(BOX_SIZE/2*scaleRatio/memoryTile.width,BOX_SIZE/2*scaleRatio/memoryTile.length);
        memoryTile.tint = Math.floor(Math.random()*0xffffff);
        makeGuard(coord.x, coord.y);    
    }

}

function makeGuard(xpos, ypos) {
    // Creates the Guard
    let guard = game.add.sprite(xLoc(xpos), yLoc(ypos), 'guard');
    guard.frame = 0;
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
    text.setText("Info: " + memoryAmount + "\n" + "Steps: " + steps);
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

        var BUTTON_Y = game.world.centerY+2*(BOX_SIZE+MARGIN);
        var OFFSET = game.world.centerX+1.75*TILE_SIZE;


        if (group) {    
            if (button1) {button1.destroy();}
            if (button2) {button2.destroy();}
            if (button3) {button3.destroy();}
        }

        reset();

        group = game.add.group(); 

        // Rotating buttons
        if (!rotated) {
            button1 = game.make.button(OFFSET, BUTTON_Y, 'buttons' , clockwise, this);
            button1.frame = 7;
            button1.scale.setTo(3*scaleRatio/4,3*scaleRatio/4);
            button1.anchor.setTo(0.15,0.5);
            addHighlight(button1);
            group.add(button1);

            button2 = game.make.button(OFFSET, BUTTON_Y, 'buttons', counterClockWise, this);
            button2.frame = 6;
            button2.scale.setTo(3*scaleRatio/4,3*scaleRatio/4);
            button2.anchor.setTo(0.85,0.5);
            addHighlight(button2);
            group.add(button2);
        } else {
            //Move Button
            button3 = game.make.button(OFFSET, BUTTON_Y, 'buttons', move, this);
            button3.frame = 5;
            button3.scale.setTo(scaleRatio,scaleRatio);
            button3.anchor.setTo(0.5,0.5);
            addHighlight(button3);
            group.add(button3);    

            button3.tint = 0x00ff00;
        }
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
            if (button1) {button1.destroy();}
            if (button2) {button2.destroy();}
            if (button3) {button3.destroy();}
            reset();
            game.world.remove(group);

        }
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
}


// used with the restart button
function actionOnClick () {

    moved = false;
    rotated = false;
    finished = false;
    youWin.visible = false;
    gameDone.visible = false;
        
    steps = 0;
    memoryAmount = 0;
    
    player.pos = {x:entrance.x, y:entrance.y};
    
    for (let x = 0;  x < board.length; x++) {
        for (let y = 0; y < board[x].length; y++) {
            board[x][y].resetRotation();
        }
    }
    for (let n = 0; n < memoryTiles.length; n++) {
        respawnGuard(n);
        guards[n].active = true;
        guards[n].tint = 0xffffff;
    }
    for (let n = 0; n < MEMORY_NUM; n++) {
        memoryTiles[n].found = false;
        memoryTiles[n].tint = Math.floor(Math.random()*(0xffffff));
    }
    if (button1) {button1.destroy();}
    if (button2) {button2.destroy();}
    if (button3) {button3.destroy();}

    positionCharacter(player);
    

    click = game.add.audio('restartClick', volume);
    click.play();
    message.text = "Collect info pieces\nand reach the exit.";
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


// To make the whole game replay
function replay() {
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