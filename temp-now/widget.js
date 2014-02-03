/*global define */
define(['underscore', 'text!temp-now/widget.tpl.html',  'weather-util', 'weather'], function(_, template, Util, weather) {
    "use strict";
    function TempNow(element) {
        weather.then(this.onLoad.bind(this));
        this.element = element;
    }
    TempNow.prototype.onLoad = function(data) {
        data = this.mapData(data);
        this.element.html(_.template(template)(_.extend({}, data, {
            cloudIcon: Util.getCloudIcon(data.weather.id),
            temp: data.temp,
            tempMax: data.tempMax,
            tempMin: data.tempMin,
            humidity:data.humidity,
            pressure:data.pressure*3/4 /* hPa to mm Hg */
        }, Util)));
    };
    TempNow.prototype.mapData = function(json) {
        return {
            city: json.city,
            temp: json.list[0].main.temp,
            tempMax: json.list[0].main.temp_max,
            tempMin: json.list[0].main.temp_min,
            humidity: json.list[0].main.humidity,
            pressure: json.list[0].main.pressure,
            weather: json.list[0].weather[0]
        };
    };
    TempNow.className = 'now';
    return TempNow;
});
