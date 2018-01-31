var loadState = {
    preload: function() {

        var loadingMessage = game.add.bitmapText(game.world.centerX, game.world.centerY, 'zigFont', "Loading    ...", 24);
        loadingMessage.anchor.setTo(0.5,0.5);


        loadingMessage.text = "Loading Sounds ...";
        
        // Used to load the background music, game over and win sounds, and UI sounds
        game.load.audio('bgm', 'assets/sounds/PuzzleTheme1.wav');
        game.load.audio('click', 'assets/sounds/click1.wav');
        game.load.audio('restartClick', 'assets/sounds/219472__jarredgibb__button-01.wav');
        game.load.audio('win!', 'assets/sounds/win.mp3');
        game.load.audio('lose', 'assets/sounds/gameover.wav');


        loadingMessage.text = "Loading UI ...";
        
        // Buttons
        game.load.spritesheet('buttons', "assets/sprites/buttons/buttons.png", 200, 200, 8);
        game.load.image('memoryBoard', 'assets/sprites/buttons/memory_board.jpg')
        game.load.image('replayImage',"assets/sprites/buttons/button_restart.png");
        
        // Overlays
        game.load.image('gameover', 'assets/sprites/menus/gameover.png');
        game.load.image('youwin', 'assets/sprites/menus/youwin.png');
        game.load.image('background', 'assets/sprites/menus/background.jpg');
        game.load.image('helpScreen','assets/sprites/menus/help.jpg');
        game.load.image('creditPage', "assets/sprites/menus/credits.jpg");
        game.load.image('logo', 'assets/sprites/menus/welcome.jpg');


        loadingMessage.text = "Loading Sprites ...";
        
        // The sprites
        game.load.image('memoryTile', 'assets/sprites/characters/puzzle.png');
        game.load.spritesheet('player', "assets/sprites/characters/Player.png", 50, 50, 4);
        game.load.spritesheet('guard' , "assets/sprites/characters/Guard.png" , 50, 50, 4);
        
        // Used to load entrance/exit
        game.load.image('entrix',"assets/sprites/tiles/EntranceExit.png");
        
        // Used to load the tiles
        for (var i = 0; i < tileNames.length; i++) {
            game.load.image('tile'+i, 'assets/sprites/tiles/' + tileNames[i]);
            tiles.push('tile'+i);
        }

        // same as above but for the combo tiles
        for (var m = 0; m < comboTileNames.length; m++) {
            game.load.image('combo'+m, 'assets/sprites/tiles/' + comboTileNames[m]);
            comboTiles.push('combo'+m);
        }
    },
    create: function() {
        console.log("Loaded!");
        game.state.start('setup');
    }

};