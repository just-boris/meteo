define(['jQuery', 'city'], function($, city) {
    "use strict";
    function requestWeather(callback) {
        updatesToRequest = REQUEST_INTERVAL;
        city.getCoordinates(function(coords) {
            $.ajax({
              url: apiUrl(coords.lat, coords.long),
              dataType: 'jsonp'
            }).then(callback);
        });
    }
    function apiUrl(lat, long) {
        return 'https://api.darksky.net/forecast/c0a2d2bd1f98cbbca777ab51b01fdd20/' + lat + ',' + long + '?units=si&extend=hourly&exclude=daily,alerts,flags';
    }
    function onLoad(response) {
        callbacks.forEach(function(callback) {
            callback(response);
        });
    }
    var REQUEST_INTERVAL = 3;
    var callbacks = [];
    var updatesToRequest;
    return {
        register: function(element, callback) {
            if(!updatesToRequest) {
                element.on('update', function() {
                    updatesToRequest--;
                    if(!updatesToRequest) {
                        requestWeather(onLoad);
                    }
                });
                requestWeather(onLoad);
            }
            callbacks.push(callback);
        }
    };
});
