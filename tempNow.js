window.TempNow = (function(d3, Util) {
    function TempNow(data, element) {
        var template = d3.select('#now\\.tpl').html();
        element.html(_.template(template)(_.extend({}, data, {
            cloudIcon: Util.getCloudIcon(data.weather.id),
            temp: Util.formatTemp(data.temp),
            tempMax: Util.formatTemp(data.tempMax, 2),
            tempMin: Util.formatTemp(data.tempMin, 2),
            humidity:data.humidity,
            pressure:data.pressure*3/4 /* hPa to mm Hg */
        })));
    }
    return TempNow;
})(d3, Util);
