var Settings;

Settings = {
    tileSize: undefined,
    heightScale: undefined,
    tileWidth: undefined,
    tileHeight: undefined,

    load: function (settings) {
        this.tileSize = settings.tileSize;
        this.heightScale = settings.heightScale;
        this.tileWidth = this.tileSize * Math.cos(Math.PI / 4) * 2;
        this.tileHeight = this.tileSize * Math.sin(Math.PI / 4) * 2 *
                this.heightScale;
    }
};