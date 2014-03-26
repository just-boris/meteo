/*global define*/
define(['d3', 'city'], function(d3, city) {
    "use strict";
    function SunsetGraph(element) {
        this.element = element;
        this.animateEnter = true;
        city.getCoordinates(this.onLoad.bind(this));
    }
    SunsetGraph.prototype.onLoad = function(coords) {
        var self = this;
        this.coords = coords;
        city.getTimezone(coords, function(timezone) {
            self.timezone = timezone;
            self.element.on('update', self.update.bind(self));
            self.update();
        });
    };
    SunsetGraph.prototype.update = function() {
        var opts = {margin: {left: 40, right: 40, top: 40, bottom: 70}, width: 600, height: 250};
        this.element.html('');
        this.svg = d3.select(this.element[0]).append("svg").attr("width", opts.width + opts.margin.left + opts.margin.right)
            .attr("height", opts.height + opts.margin.top + opts.margin.bottom);
        this.plot = this.svg.append("g").attr("transform", "translate(" + opts.margin.left + "," + opts.margin.top + ")");

        var x = d3.time.scale.utc().range([0, opts.width]).domain([0, 24 * 3600 * 1000 + 1]),
            y = d3.scale.linear().range([opts.height, 0]).domain([-90, 90]).nice();

        var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(d3.time.hour, 3).tickFormat(d3.time.format.utc("%H:%M"));

        this.plot.append("g").attr("class", "x axis").attr("transform", "translate(0," + opts.height + ")").call(xAxis);
        this.plot.append('line').attr({
            x1: x.range()[0], y1: y(0),
            x2: x.range()[1], y2: y(0)
        });

        var line = d3.svg.line().x(x).y(y(0)),
            path = this.plot.append("path")
                .datum(d3.range.apply(d3, x.domain().concat(1800 * 1000)))
                .attr("class", "line").attr("d", line),
            sun = this.plot.append('circle').data([this.timeFromMidnight()]).attr({
                cx: x(0), cy: y(0), r: 0
            }).style('fill', 'url(#sunFill)'),
            zeroTicks = this.plot.selectAll('.zero').data(this.getZeroTimes()).enter().append('text').classed('zero', true).attr({
                x: x,
                y: y(0),
                dy: '1.5em'
            }).style({opacity: 0, 'text-anchor':'middle'}).text(d3.time.format.utc("%H:%M"));
        this.gradient('sunFill', '#ffa500', '#ffcc00');

        line.y(function(time) {
            return y(this.sunPosition(time));
        }.bind(this));
        if(this.animateEnter) {
            this.animateEnter = false;
            var transition = this.svg.transition().duration(1000);
            path = transition.selectAll('.line');
            sun = transition.transition().duration(1000).selectAll('circle');
            zeroTicks = transition.transition().duration(1000).selectAll('.zero');
        }
        sun.attr({
            cx: x,
            r: 10,
            cy: function(time) {
                return y(this.sunPosition(time));
            }.bind(this)
        });
        zeroTicks.style({opacity: 1});
        path.attr('d', line);
    };
    SunsetGraph.prototype.getZeroTimes = function() {
        var time = this.radToTime(Math.acos(this.sunAltitudeOffset()/this.sunAmplitude()));
        return [new Date(this.msecInDay-time - this.getNoonOffset()), new Date(time - this.getNoonOffset())];
    };
    SunsetGraph.prototype.axialTilt = 23.452;
    SunsetGraph.prototype.msecInDay = 1000 * 60 * 60 * 24;
    SunsetGraph.prototype.timeFromMidnight = function() {
        var now = new Date();
        now.setHours(0);
        now.setMinutes(0);
        now.setSeconds(0);
        now.setMilliseconds(0);
        return Date.now() - now.getTime();
    };
    SunsetGraph.prototype.dayInYear = function() {
        var now = new Date(),
            start = new Date(now.getFullYear(), 0, 0);
        return Math.floor((now - start) / this.msecInDay);
    };
    SunsetGraph.prototype.getSummerSolstice = function() {
        return 31 + 28 + 31 + 30 + 31 + 22;
    };
    SunsetGraph.prototype.sunAmplitude = function() {
        return 90 - this.coords[0];
    };
    SunsetGraph.prototype.sunAltitudeOffset = function() {
        return Math.cos(this.daysToRad(this.dayInYear() - this.getSummerSolstice())) * this.axialTilt;
    };
    SunsetGraph.prototype.daysToRad = function(days) {
        return 2 * Math.PI * days / (365);
    };
    SunsetGraph.prototype.timeToRad = function(time) {
        return Math.PI * time / (this.msecInDay/2);
    };
    SunsetGraph.prototype.radToTime = function(rad) {
        return (this.msecInDay/2) * rad / Math.PI;
    };
    SunsetGraph.prototype.sunPosition = function(time) {
        return -this.sunAmplitude() * Math.cos(this.timeToRad(time + this.getNoonOffset())) + this.sunAltitudeOffset();
    };
    SunsetGraph.prototype.getNoonOffset = function() {
        return (24 * this.coords[1] / 360 - this.timezone) * 3600 * 1000;
    };
    SunsetGraph.prototype.gradient = function(name, start, stop) {
        var gradient = this.svg.append("svg:defs").append("svg:radialGradient")
            .attr("id", name)
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%")
            .attr("spreadMethod", "pad");
        gradient.append("svg:stop")
            .attr("offset", "0%")
            .attr("stop-color", start)
            .attr("stop-opacity", 1);
        gradient.append("svg:stop")
            .attr("offset", "100%")
            .attr("stop-color", stop)
            .attr("stop-opacity", 0.1);
    };
    SunsetGraph.className = 'sun-graph plot';
    return SunsetGraph;
});
