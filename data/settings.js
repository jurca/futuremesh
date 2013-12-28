Settings.load({
    tileSize: 20,
    heightScale: 0.82,
    gridIndexGranularity: 5,
    sfx3DLightFactor: 1.5,
    sfx3DLightColor: '#ffffff',
    sfxBuildLayerColor: '#ff0000',
    sfxAccessibleTileColor: '#00a000',
    sfxInaccessibleTileColor: '#a00000',
    mouseWheelSpeed: 0.4,
    loadingMusic: ['data/music/loading.mp3', 'data/music/loading.ogg'],
    loadingMusicVolume: 0.01,
    loadingMusicLength: 15.6745,
    gameMusic: {
        playlists: {
            0: [
                {
                    src: [ 'data/music/gameplay/babylon.ogg' ],
                    duration: 251.4
                },
                {
                    src: [ 'data/music/gameplay/winter-reflections.ogg' ],
                    duration: 140.8
                }
            ],
            0.5 : [
                {
                    src: [ 'data/music/gameplay/techno-dog.ogg' ],
                    duration: 189.7
                },
                {
                    src: [ 'data/music/gameplay/dance-zone.ogg' ],
                    duration: 82.2
                }
            ],
            1: [
                {
                    src: [ 'data/music/gameplay/fast-track.ogg' ],
                    duration: 30.8
                },
                {
                    src: [ 'data/music/gameplay/long-time-coming.ogg' ],
                    duration: 274
                }
            ]
        },
        fadeDuration: 3500,
        volume: 0.7
    },
    tickDuration: 30, // 33 ticks per second
    maxTicks: 2,
    gamePlayPlugins: [
        //'Benchmark',
        //'GameMusicPlugin',
        'ConstructionButtonsScroller',
        'BuildingsConstructionUIPlugin',
        'UnitsConstructionUIPlugin',
        'ResourceManagerPlugin',
        'ResourceManagerUIPlugin',
        'BuildingsUnitsConstruction',
        'ViewRendererPlugin',
        'MinimapControlPlugin',
        'KeyboardMapScroller',
        'UnitAI',
        'MousePlugin',
        'BuildingControl'
    ],
    pluginConfiguration: {
        BuildingsUnitsConstruction: {
            maxQueueLength: 30
        },
        KeyboardMapScroller: {
            scrollSpeed: 30
        },
        ViewRendererPlugin: {
            borderOffset: 30, // pixels
            minimap: {
                width: 200,
                height: 200
            }
        }
    }
});