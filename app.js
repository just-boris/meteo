requirejs.config({
    paths: {
        d3: '//cdnjs.cloudflare.com/ajax/libs/d3/3.3.13/d3.min',
        underscore: '//yandex.st/underscore/1.5.2/underscore-min',
        text: '//cdnjs.cloudflare.com/ajax/libs/require-text/2.0.10/text'
    },
    shim: {
        underscore: { exports: '_' },
        d3: { exports: 'd3' }
    }
});
require(['d3'], function(d3) {
    function getWidgets() {
        return ['temp-now', 'temp-plot', 'clock', 'add-btn'].map(function(widgetName) {
            return widgetName+'/widget'
        });
    }
    var API_URL = "http://api.openweathermap.org/data/2.5/forecast?q=Saint%20Petersburg&mode=json&units=metric";
    require(getWidgets(), function() {
        var widgets = Array.prototype.slice.call(arguments, 0),
            container = d3.select('.widgets');
        d3.json(API_URL, function(error, json) {
            if (error) {
                console.warn(error);
                return;
            }
            widgets.forEach(function(Widget) {
                new Widget(container.append('div').classed(Widget.className || '', true), json)
            });
        });
    });

});