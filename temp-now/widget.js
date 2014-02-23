/*global define */
define(['underscore', 'text!temp-now/widget.tpl.html',  'weather-util', 'weather', 'storage'], function(_, template, Util, weather, storage) {
    "use strict";
    function TempNow(element) {
        weather.register(element, this.onLoad.bind(this));
        element.on('update', this.onUpdate.bind(this));
        this.element = element;
    }
    TempNow.prototype.onEditCity = function() {
        var editing = !this.editBtn.data('editing'),
            city;
        this.editBtn.data('editing', editing);
        this.editBtn.toggleClass('fa-pencil', !editing).toggleClass('fa-check', editing);
        if(editing) {
            city = this.cityBlock.html();
            this.cityBlock.html('<input type="text" value="'+city+'"/>');
        }
        else {
            city = this.cityBlock.find('input').val();
            this.cityBlock.html(city);
            storage.setCity(city);
            location.reload();
        }
    };
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
        this.cityBlock = this.element.find('.city_name');
        this.editBtn = this.element.find('.city_edit').data('editing', false).on('click', this.onEditCity.bind(this));
    };
    TempNow.prototype.onUpdate = function() {

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
