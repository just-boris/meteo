define(['d3', 'util', 'text!temp-now/widget.tpl.html'], function(d3, Util, template) {
    function TempNow(element, data) {
        data = this.mapData(data);
        element.html(_.template(template)(_.extend({}, data, {
            cloudIcon: Util.getCloudIcon(data.weather.id),
            temp: Util.formatTemp(data.temp),
            tempMax: Util.formatTemp(data.tempMax, 2),
            tempMin: Util.formatTemp(data.tempMin, 2),
            humidity:data.humidity,
            pressure:data.pressure*3/4 /* hPa to mm Hg */
        }, this.viewHelpers)));
    }
    TempNow.prototype.viewHelpers = {
        formatNumber: function(number, decimals) {
            var multiplier = Math.pow(10, decimals);
            return Math.round(number*multiplier)/multiplier;
        }
    };
    TempNow.prototype.mapData = function(json) {
        return {
            city: json.city.name,
            temp: json.list[0].main.temp,
            tempMax: json.list[0].main.temp_max,
            tempMin: json.list[0].main.temp_min,
            humidity: json.list[0].main.humidity,
            pressure: json.list[0].main.pressure,
            weather: json.list[0].weather[0]
        }
    };
    TempNow.className = 'now';
    return TempNow;
});
