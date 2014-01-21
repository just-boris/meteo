/*global define */
define(['app', 'weather', 'text!temp-now/widget.html'], function(app, weather, template) {
    "use strict";
    return {
        className: 'now',
        template: template,
        controller: function($scope, weather) {
            weather.load().then(function(response) {
                var currentWeather = response.list[0];
                $scope.cloudIcon = weather.getCloudIcon(currentWeather.weather[0].id, currentWeather.dt*1000);
                $scope.temp = currentWeather.main.temp;
                $scope.tempMax = currentWeather.main.temp_max;
                $scope.tempMin = currentWeather.main.temp_min;
                $scope.description = currentWeather.weather[0].description;
                $scope.humidity = currentWeather.main.humidity;
                $scope.pressure = currentWeather.main.pressure*3/4; // hPa to mm Hg
                $scope.city = response.city;
            });
        }
    };
});
