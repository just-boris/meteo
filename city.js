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
        $.getJSON('http://geocode-maps.yandex.ru/1.x/?lang=en-US&results=1&format=json&kind=locality&geocode=' + geoInfo, function (json) {
            callback(json.response.GeoObjectCollection.featureMember[0].GeoObject);
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
                    var position = city.Point.pos.split(' ').map(function(coord) {return parseFloat(coord);});
                    callback({long: position[0], lat: position[1]});
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
                    geocode(coords.long+','+coords.lat, function(city) {
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
