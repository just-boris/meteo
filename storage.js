/*global define, require */
define('localStorage', [], function() {
    "use strict";
    return window.localStorage;
});
define('geolocation', [], function() {
    "use strict";
    return navigator.geolocation;
});
define(['jQuery', 'geolocation', 'localStorage', 'json!widgets.json'], function($, geolocation, storage, widgets) {
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
        },
        getCity: function(callback) {
            var city = storage.getItem('city');
            if (city) {
                callback(city);
            } else {
                navigator.geolocation.getCurrentPosition(function (response) {
                    var coords = [response.coords.longitude, response.coords.latitude].join(',');
                    jQuery.getJSON('http://geocode-maps.yandex.ru/1.x/?lang=en-US&results=1&format=json&kind=locality&geocode=' + coords, function (json) {
                        callback(json.response.GeoObjectCollection.featureMember[0].GeoObject.name);
                    });
                }, function (error) {
                    console.warn(error);
                });
            }
        },
        setCity: function(city) {
            storage.setItem('city', city);
        }
    };
});
