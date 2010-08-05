var Map;

Map = function () {
    (function (that) {
        var map;

        map = [];

        that.setMap = function (newMap) {
            map = newMap;
        };

        that.getView = function (x, y, width, height) {
            var view, i;
            view = map.slice(y, y + height);
            width += x;
            for (i = height; i--;) {
                view[i] = view[i].slice(x, width);
            }
            return view;
        };

        that.randomMap = function (width, height) {
            var i, j, row;
            map = [];
            for (i = height; i--;) {
                row = [];
                for (j = width; j--;) {
                    row.push({
                        type: Math.round(Math.random() * 2),
                        accessible: Math.round(Math.random() * 2) > 0
                    });
                }
                map.push(row);
            }
        };
    }(this));
};