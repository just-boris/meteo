/*global define, registry */
define(function() {
    "use strict";
    return registry
        .value('geolocation', navigator.geolocation)
        .filter('temperature', function() {
            return function(temperature, presition) {
                return temperature ? (temperature > 0 ? '+' : '')+temperature.toFixed(presition || 0) : '';
            };
        })
        .filter('numberNoTrailing', function() {
            return function(number, decimals) {
                var multiplier = Math.pow(10, decimals);
                return Math.round(number*multiplier)/multiplier;
            };
        })
        .factory('weather', function($q, $http, city) {
            return {
                load: function() {
                    var deferred = $q.defer();
                    city.get().then(function(city) {
                        var httpPromise = $http.get('http://api.openweathermap.org/data/2.5/forecast', {params: {
                            mode: 'json',
                            units: 'metric',
                            q: city
                        }}).then(function(response) {
                            return response.data;
                        });
                        deferred.resolve(httpPromise);
                    }, function(error) {
                        console.warn(error);
                    });
                    return deferred.promise;
                },
                /*from http://bugs.openweathermap.org/projects/api/wiki/Weather_Condition_Codes*/
                getCloudIcon: function(cloudId, time) {
                    var hours = new Date(time).getHours(),
                        isDaytime = hours > 7 && hours < 19;
                    switch(Math.floor(cloudId/100)) {
                        case 2:
                            return isDaytime ? 'wi-day-thunderstorm' : 'wi-night-alt-thunderstorm';
                        case 3:
                            return 'wi-rain';
                        case 5:
                            return isDaytime ? 'wi-day-rain-mix' : 'wi-night-alt-showers';
                        case 6:
                            return 'wi-snow';
                        case 7:
                            return 'wi-fog';
                        case 8:
                            if(cloudId > 802) {
                                return 'wi-cloudy';
                            }
                            else if(isDaytime) {
                                return {800: 'wi-day-sunny', 801: 'wi-day-sunny-overcast', 802: 'wi-day-cloudy'}[cloudId];
                            }
                            return cloudId === 800 ?  'wi-night-clear' : 'wi-night-cloudy';
                        case 9:
                            return 'wi-strong-wind';
                        default:
                            return 'wi-celcius';
                    }
                }
            };
        })
        .factory('city', function($q, $storage, $http, geolocation) {
            var store = $storage('city');
            return {
                get: function() {
                    function onError(error) {
                        deferred.reject(error);
                    }
                    var deferred = $q.defer(),
                        city = store.getItem('city');

                    if (city) {
                        deferred.resolve(city);
                    } else {
                        geolocation.getCurrentPosition(function (response) {
                            $http.get('http://geocode-maps.yandex.ru/1.x/', {params: {
                                lang: 'en-US',
                                results: 1,
                                format: 'json',
                                kind: 'locality',
                                geocode: [response.coords.longitude, response.coords.latitude].join(',')
                            }}).then(function(response) {
                                deferred.resolve(response.data.response.GeoObjectCollection.featureMember[0].GeoObject.name);
                            }, onError);
                        }, onError);
                    }
                    return deferred.promise;
                },
                set: function(name) {
                    store.setItem('city', name);
                }
            };
        });
});
