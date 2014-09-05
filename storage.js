/*global define, require */
define(['localStorage', 'json!widgets.json'], function(storage, widgets) {
    "use strict";
    var allWidgets = widgets;
    return {
        getAllWidgets: function() {
            return allWidgets;
        },
        getWidgets: function() {
            var value = storage.getItem('widgets');
            return value ? JSON.parse(value) : allWidgets.map(function(widget) {
                return widget.name;
            }).concat('settings');
        },
        setWidgets: function(newWidgets) {
            storage.setItem('widgets', JSON.stringify(newWidgets));
        }
    };
});
