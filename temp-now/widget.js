/*global define */
define(['underscore', 'text!temp-now/widget.tpl.html',  'weather-util', 'weather', 'city'], function(_, template, Util, weather, city) {
    "use strict";
    var templateFn = _.template(template);
    function TempNow(element) {
        weather.register(element, this.onLoad.bind(this));
        this.element = element;
        this.cityName = 'Loading...';
        city.getCityName(function(name) {
          this.cityName = name;
        }.bind(this))
    }
    TempNow.prototype.onEditCity = function() {
        var editing = !this.editBtn.data('editing'),
            currentCity;
        this.editBtn.data('editing', editing);
        this.editBtn.toggleClass('fa-pencil', !editing).toggleClass('fa-check', editing);
        if(editing) {
            currentCity = this.cityBlock.html();
            this.cityBlock.html('<input type="text" value="'+currentCity+'"/>');
        }
        else {
            currentCity = this.cityBlock.find('input').val();
            this.cityBlock.html(currentCity);
            city.setCityName(currentCity);
            location.reload();
        }
    };
    TempNow.prototype.onLoad = function(data) {
        data = this.mapData(data);
        this.element.html(templateFn(_.extend({}, data, Util)));
        this.cityBlock = this.element.find('.city_name');
        this.editBtn = this.element.find('.city_edit').data('editing', false).on('click', this.onEditCity.bind(this));
    };
    TempNow.prototype.mapData = function(json) {
        var weather = json.currently;
        return {
            city: this.cityName,
            cloudIcon: Util.getCloudIcon(weather.icon),
            temp: weather.temperature,
            apparentTemp: weather.apparentTemperature,
            humidity: weather.humidity * 100,
            pressure: weather.pressure*3/4 /* hPa to mm Hg */,
            summary: weather.summary
        };
    };
    TempNow.className = 'now';
    return TempNow;
});
