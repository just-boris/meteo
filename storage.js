/*global define, require */
define(['localStorage'], function(storage) {
    "use strict";
    var allWidgets = [
        {name: 'temp-now', title: 'Temperature now', description: 'Shows current weather and temperature'},
        {name: 'temp-plot', title: 'Temperature forecast', description: 'Weather forecast for the next 3 days'},
        {name: 'clock', title: 'Digital clock', description: 'Date and time now'}
    ];
    return {
        getAll: function() {
            return allWidgets;
        },
        get: function() {
            var value = storage.getItem('widgets');
            return value ? JSON.parse(value) : allWidgets.map(function(widget) {
                return widget.name;
            }).concat('settings');
        },
        set: function(newWidgets) {
            storage.setItem('widgets', JSON.stringify(newWidgets));
        }
    };
});
