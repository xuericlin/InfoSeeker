var bootState = {
    preload: function() {
        game.load.bitmapFont('zigFont', 'assets/zig/font/font.png','assets/zig/font/font.fnt');
    },
    create: function() {

        console.log("Booted!");
        game.state.start('load');
    }
};