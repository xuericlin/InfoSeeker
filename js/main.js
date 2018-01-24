var mainState = {
    create: function() {
        makeBackground();

        boardGenerator();

        makePlayer();

        makeMemoryTiles();

        memoryBoardGenerator();

        backgroundMusic();

        makeUI();
    },
    update: function() {
        
        if (finished) {
            return;
        } else {
            finished = checkGameStatus();
        }
        animateCount++;
        
        if (rotated) {
            message.text = "YOU ROTATED. \nTap/Click to move.";
        }
        if (moved) {
            message.text = "YOU MOVED. \nTap/Click to rotate.";
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
        if (animateCount == 10) {
            runAnimations();
            animateCount = 0;
        }
        game.input.mouse.enabled = !game.device.mspointer
        
    }
};

function runAnimations() {
    for (let i = 0; i < MEMORY_NUM; i++) {
            guards[i].frame = (guards[i].frame + 1) % 4;
    }
    player.frame = (player.frame + 1) % 4;
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

        // Normalize fp math
        deltaX = Math.round(deltaX); 
        deltaY = Math.round(deltaY);
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
        positionCharacter(character);
        character.zone = 1;
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
                console.log(character.zone, this.zone1, this.zone2);
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

        // Normalize fp math
        deltaX = Math.round(deltaX); 
        deltaY = Math.round(deltaY);

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
        console.log(this.zone1, this.zone2);

    }
    moveAway(character) {
        if (this.zone1.includes(character)) {
            this.zone1.splice(this.zone1.indexOf(character), 1);
        }
        else {
            this.zone2.splice(this.zone2.indexOf(character), 1);
        }
        console.log(this.zone1, this.zone2);
    }
    sameZone(player, guard) {
        return this.zone1.includes(player) == this.zone1.includes(guard) ||
               this.zone2.includes(player) == this.zone2.includes(guard);
    }
    joinZone(character) {
        if (character.zone) {
            console.log("Here I am");
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
        if (this.canGoNorth(character)) {
            character.y -= TILE_SIZE/3-10*scaleRatio;
        } else if (this.canGoSouth(character)) {
            character.y += TILE_SIZE/3-10*scaleRatio;
        } else if (this.canGoWest(character)) {
            character.x -= TILE_SIZE/3-10*scaleRatio;
        } else if (this.canGoEast(character)) {
            character.x += TILE_SIZE/3-10*scaleRatio;
        } else {
            print("Error: Character was not able to be positioned");
        }

    }
    resetRotation() {
        this.image.angle = this.initialRotation;
        this.rotation = this.initialRotation
        this.zone1 = [];
        this.zone2 = [];
    }
}

/*
    Helper functions to shorten code/ make it readable
*/
// Both return the coordinate value for the board index values
function xLoc(x) {
    return game.world.centerX+(x-1.5)*(TILE_SIZE);
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
        if (player.pos.x == guard.pos.x && player.pos.y == guard.pos.y && board[guard.pos.x][guard.pos.y].sameZone(player, guard)) {
            console.log(board[guard.pos.x][guard.pos.y]);
            return lose("You've been found!");
        } else if (player.pos.x == exit.x && player.pos.y == exit.y) {
            if (memoryAmount == MEMORY_NUM) {
                return win();
            } else {
                message.text = "You haven't collected\nall the information!";
            }
            
        }
    }
    if (possibleMovements(player).length == 0) {
        return lose("You cannot move!");        
    }
    return false;
}

function lose(string) {
    message.text = string+"\nPress reset button\nto try again.";
    if (finished) {
        return true;
    }
    // Sound
    youlose = game.add.audio('lose', volume, false);
    youlose.play();
    // Screen
    gameDone.visible = true;
    gameDone.bringToTop(); 
    return true;
}

function win() {

    // scoring section
    if (steps <= 20) {
        score = 10;
    } else if (steps <= 40) {
        score = 5;
    } else {
        score = 1;
    }

    score = scoreHolder + score;

    scoreText.setText("Score: " + score, 20);

    message.text = "Level completed!\nPress anywhere for\na new level.";
    scoreHolder = score;
    if (finished) {
        return true;
    }
    COMBO_SPAWN = Math.min(COMBO_SPAWN+0.2, 0.5);
    //Sound
    youwin = game.add.audio('win!',volume, false);
    youwin.play();
    // Message to player
    youWin.visible = true;
    youWin.bringToTop();
    // Replay
    youWin.inputEnabled = true;
    youWin.events.onInputDown.add(replay,this);
    return true;
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
            memoryTiles[n].tint = 0x000000;
            updateText();
        }
    }
}

// Respawns the guard in their corresponding memory tile
function respawnGuard(n) {
    let xpos = memoryTiles[n].pos.x;
    let ypos = memoryTiles[n].pos.y;
    guards[n].pos = {x: xpos, y: ypos};
    board[xpos][ypos].joinZone(guards[n]);
}
