define(['d3'], function(d3) {
    function TimeNow(element) {
        this.time = $('<div>').appendTo(element).addClass('time centered jumbotron');
        this.date = $('<div>').appendTo(element).addClass('date');
        this.updateTime();
        element.on('update', this.updateTime.bind(this))
    }
    TimeNow.prototype.updateTime = function() {
        var now = new Date();
        this.time.text(d3.time.format('%H:%M')(now));
        this.date.text(d3.time.format('%a, %e %B %Y')(now));
    };
    TimeNow.className = 'clock';
    return TimeNow;
});