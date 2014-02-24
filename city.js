/*global define, require */
define('geolocation', [], function() {
    "use strict";
    return navigator.geolocation;
});
define(['localStorage', 'geolocation', 'jQuery'], function(storage, geolocation, $) {
    "use strict";
    function getStoredCity() {
        return storage.getItem('city');
    }
    function getPosition(callback) {
        geolocation.getCurrentPosition(function (response) {
            callback([response.coords.longitude, response.coords.latitude]);
        });
    }
    function geocode(geoInfo, callback) {
        $.getJSON('http://geocode-maps.yandex.ru/1.x/?lang=en-US&results=1&format=json&kind=locality&geocode=' + geoInfo, function (json) {
            callback(json.response.GeoObjectCollection.featureMember[0].GeoObject);
        }, function (error) {
            console.warn(error);
        });
    }

    return {
        getTimezone: function(coords, callback) {
            $.getJSON('https://maps.googleapis.com/maps/api/timezone/json?timestamp='+(Date.now()/1000)+'&sensor=true&location='+coords.reverse().join(','), function(json) {
                callback((json.rawOffset+json.dstOffset)/3600);
            });
        },
        getCoordinates: function(callback) {
            var city = getStoredCity();
            if(city) {
                geocode(city, function(city) {
                    callback(city.Point.pos.split(' ').map(function(coord) {return parseFloat(coord);}));
                });
            }
            else {
                getPosition(callback);
            }
        },
        getCityName: function(callback) {
            var city = getStoredCity();
            if (city) {
                callback(city);
            } else {
                getPosition(function(coords) {
                    geocode(coords.join(','), function(city) {
                        callback(city.name);
                    });
                });
            }
        },
        setCityName: function(city) {
            storage.setItem('city', city);
        }
    };
});
