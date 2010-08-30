var Map;

Map = function () {
    var map;

    map = [];

    this.setMap = function (newMap) {
        map = newMap;
    };

    this.getView = function (x, y, width, height) {
        var view, i;
        view = map.slice(y, y + height);
        width += x;
        for (i = height; i--;) {
            view[i] = view[i].slice(x, width);
        }
        return view;
    };

    this.randomMap = function (width, height) {
        var i, j, row;
        map = [];
        for (i = height; i--;) {
            row = [];
            for (j = width; j--;) {
                row.push({
                    type: Math.round(Math.random() * 2),
                    accessible: Math.round(Math.random() * 2) > 1,
                    minimap: 'rgb(' + Math.round(Math.random() * 255) + ',' +
                            Math.round(Math.random() * 255) + ',' +
                            Math.round(Math.random() * 255) + ')'
                });
            }
            map.push(row);
        }
    };
};