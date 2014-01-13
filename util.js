window.Util = (function() {
    return {
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
                        return 'wi-cloudy'
                    }
                    else if(isDaytime) {
                        return {800: 'wi-day-sunny', 801: 'wi-day-sunny-overcast', 802: 'wi-day-cloudy'}[cloudId];
                    }
                    else {
                        return cloudId === 800 ?  'wi-night-clear' : 'wi-night-cloudy';
                    }
                case 9:
                    return 'wi-strong-wind';
                default:
                    return 'wi-celcius';
            }
        },
        formatTemp : function(temperature, presition) {
            return (temperature > 0 ? '+' : '')+temperature.toFixed(presition || 0);
        }
    }
})();