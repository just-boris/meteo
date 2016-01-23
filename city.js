/*global define, require */
define('geolocation', [], function() {
    "use strict";
    return navigator.geolocation;
});
define(['localStorage', 'geolocation', 'jQuery', 'moment'], function(storage, geolocation, $, moment) {
    "use strict";
    function getStoredCity() {
        return location.search.substring(1) || storage.getItem('city');
    }
    function getPosition(callback) {
        geolocation.getCurrentPosition(function (response) {
            callback({long: response.coords.longitude, lat: response.coords.latitude});
        });
    }
    function geocode(geoInfo, callback) {
        $.getJSON('https://maps.googleapis.com/maps/api/geocode/json?address=' + geoInfo, function (json) {
            if(json.results && json.results.length > 0) {
                var result = json.results[0];
                callback({
                    name: result.formatted_address.split(',').shift(),
                    location: result.geometry.location
                });
            }
        }, function (error) {
            console.warn(error);
        });
    }

    var timezone;

    return {
        getTimezone: function(coords, callback) {
            if(!timezone) {
                timezone = $.getJSON('https://maps.googleapis.com/maps/api/timezone/json?timestamp='+(Date.now()/1000)+'&sensor=true&location='+coords.lat+','+coords.long);
            }
            timezone.then(function(json) {
                callback(json);
            });
        },
        getLocalTime: function(coords, callback) {
            this.getTimezone(coords, function(timezone) {
                callback(moment().zone(-(timezone.rawOffset+timezone.dstOffset)/60));
            });
        },
        getCoordinates: function(callback) {
            var city = getStoredCity();
            if(city) {
                geocode(city, function(city) {
                    callback({long: city.location.lng, lat: city.location.lat});
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
                    geocode(coords.lat+','+coords.long, function(city) {
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
