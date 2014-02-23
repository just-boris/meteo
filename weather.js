define(['jQuery', 'storage'], function($, storage) {
    "use strict";
    function requestWeather() {
        updatesToRequest = REQUEST_INTERVAL;
        storage.getCity(function(city) {
            $.getJSON(API_URL+city).then(function(response) {
                onLoad(response);
            });
        });
    }
    function onLoad(response) {
        callbacks.forEach(function(callback) {
            callback(response);
        });
    }
    var API_URL = 'http://api.openweathermap.org/data/2.5/forecast?&mode=json&units=metric&q=',
        REQUEST_INTERVAL = 3,
        callbacks = [],
        updatesToRequest;
    return {
        register: function(element, callback) {
            if(!updatesToRequest) {
                element.on('update', function() {
                    updatesToRequest--;
                    if(!updatesToRequest) {
                        requestWeather();
                    }
                });
                requestWeather();
            }
            callbacks.push(callback);
        }
    };
});
