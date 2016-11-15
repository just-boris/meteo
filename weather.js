define(['jQuery', 'city'], function($, city) {
    "use strict";
    function requestWeather() {
        updatesToRequest = REQUEST_INTERVAL;
        city.getCityName(function(city) {
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
    var API_URL = '//api.openweathermap.org/data/2.5/forecast?appid=4bbb7ef57e1449b7f7369384b30aead0&mode=json&units=metric&q=',
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
