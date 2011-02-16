var Settings;

Settings = {
    tileSize: undefined,
    heightScale: undefined,
    tileWidth: undefined,
    tileHeight: undefined,
    gridIndexGranularity: undefined,
    tileImagesTransformed: false,
    buildingImagesTransformed: false,
    unitImagesTransformed: false,

    load: function (settings) {
        this.tileSize = settings.tileSize;
        this.heightScale = settings.heightScale;
        this.tileWidth = this.tileSize * Math.cos(Math.PI / 4) * 2;
        this.tileHeight = this.tileSize * Math.sin(Math.PI / 4) * 2 *
                this.heightScale;
        this.gridIndexGranularity = settings.gridIndexGranularity;
        if (settings.tileImagesTransformed !== undefined) {
            this.tileImagesTransformed = settings.tileImagesTransformed;
        }
        if (settings.buildingImagesTransformed !== undefined) {
            this.buildingImagesTransformed =
                    settings.buildingImagesTransformed;
        }
        if (settings.unitImagesTransformed !== undefined) {
            this.unitImagesTransformed = settings.unitImagesTransformed;
        }
    }
};