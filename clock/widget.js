/*global define*/
define(['jQuery', 'city'], function($, city) {
    "use strict";
    function TimeNow(element) {
        this.element = element;
        this.time = $('<div>').appendTo(element).addClass('time centered jumbotron');
        this.date = $('<h1>').appendTo(element).addClass('date');
        city.getCoordinates(this.onLoadLocation.bind(this));
    }
    TimeNow.prototype.onLoadLocation = function(coords) {
        this.coords = coords;
        this.updateTime();
        this.element.on('update', this.updateTime.bind(this));
    };
    TimeNow.prototype.updateTime = function() {
        var self = this;
        city.getLocalTime(this.coords, function(now) {
            self.time.text(now.format('H:m'));
            self.date.text(now.format('ddd, D MMMM YYYY'));
        });
    };
    TimeNow.className = 'clock';
    return TimeNow;
});
