define(['d3'], function(d3) {
    function TimeNow(element) {
        var now = new Date();
        element.append('div').classed('time centered jumbotron', true).text(d3.time.format('%H:%M')(now));
        element.append('h1').classed('date', true).text(d3.time.format('%a, %e %B %Y')(now));
    }
    TimeNow.className = 'clock';
    return TimeNow;
});