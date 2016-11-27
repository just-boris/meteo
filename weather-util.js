/*global define*/
define(function() {
    "use strict";
    return {
        /*from https://darksky.net/dev/docs/response*/
        getCloudIcon: function(iconName) {
            switch(iconName) {
                case 'clear-day':
                  return 'wi wi-day-sunny';
                case 'clear-night':
                  return 'wi wi-night-clear';
                case 'rain':
                  return 'wi wi-rain';
                case 'snow':
                  return 'wi wi-snow';
                case 'sleet':
                  return 'wi wi-sleet';
                case 'wind':
                  return 'wi wi-windy';
                case 'fog':
                  return 'wi wi-fog';
                case 'cloudy':
                  return 'wi wi-cloudy';
                case 'partly-cloudy-day':
                  return 'wi wi-day-cloudy';
                case 'partly-cloudy-night':
                  return 'wi wi-night-alt-cloudy'
                default:
                  return 'wi wi-celsius';
            }
        },
        getWorstWeather: function(weathers) {
            var groups = [
              'clear-night',
              'clear-day',
              'partly-cloudy-night',
              'partly-cloudy-day',
              'cloudy',
              'fog',
              'wind',
              'rain',
              'sleet',
              'snow'
            ];
            function compareId(a, b) {
                return groups.indexOf(a) > groups.indexOf(b);
            }
            return weathers.reduce(function(a, b) {
               return compareId(a.icon, b.icon) ? a : b;
            });
        },
        formatNumber: function(number, presition) {
            var multiplier = presition ? Math.pow(10, presition) : 1;
            return Math.round(number*multiplier)/multiplier;
        },
        formatTemp : function(temperature, presition) {
            temperature = this.formatNumber(temperature, presition);
            return (temperature > 0 ? '+' : '')+temperature;
        }
    };
});
