/*global define*/
define(['d3', 'city', 'suncalc'], function(d3, city, suncalc) {
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
        var opts = {margin: {left: 40, right: 40, top: 40, bottom: 70}, width: 600, height: 250},
            now = new Date();
        this.element.html('');
        this.svg = d3.select(this.element[0]).append("svg").attr("width", opts.width + opts.margin.left + opts.margin.right)
            .attr("height", opts.height + opts.margin.top + opts.margin.bottom);
        this.plot = this.svg.append("g").attr("transform", "translate(" + opts.margin.left + "," + opts.margin.top + ")");

        var x = d3.time.scale().range([0, opts.width]).domain(this.getDayBounds(now)),
            y = d3.scale.linear().range([opts.height, 0]).domain([-Math.PI/2, Math.PI/2]).nice();

        var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(d3.time.hour, 3).tickFormat(d3.time.format("%H:%M"));

        this.plot.append("g").attr("class", "x axis").attr("transform", "translate(0," + opts.height + ")").call(xAxis);
        this.plot.append('line').attr({
            x1: x.range()[0], y1: y(0),
            x2: x.range()[1], y2: y(0)
        });

        var line = d3.svg.line().x(x).y(y(0)),
            path = this.plot.append("path")
                .datum(d3.range.apply(d3, x.domain().concat(1800 * 1000)))
                .attr("class", "line").attr("d", line),
            sun = this.plot.append('circle').data([now]).attr({
                cx: x(0), cy: y(0), r: 0
            }).style('fill', 'url(#sunFill)'),
            sunTimes = suncalc.getTimes(this.toNoon(now), this.coords[0], this.coords[1]),
            zeroTicks = this.plot.selectAll('.zero').data([sunTimes.sunrise, sunTimes.sunset]).enter().append('text').classed('zero', true).attr({
                x: x,
                y: y(0),
                dy: '1.5em'
            }).style({opacity: 0, 'text-anchor':'middle'}).text(d3.time.format("%H:%M"));
        this.gradient('sunFill', '#ffa500', '#ffcc00');

        line.y(function(time) {
            return y(suncalc.getPosition(time, this.coords[0], this.coords[1]).altitude);
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
                return y(suncalc.getPosition(time, this.coords[0], this.coords[1]).altitude);
            }.bind(this)
        });
        zeroTicks.style({opacity: 1});
        path.attr('d', line);
    };
    SunsetGraph.prototype.toMidnight = function(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    };
    SunsetGraph.prototype.toNoon = function(date) {
        var noon = this.toMidnight(date);
        noon.setHours(12);
        return noon;
    };
    SunsetGraph.prototype.getDayBounds = function(time) {
        var midnight = this.toMidnight(time),
            next = new Date(midnight.getTime());
        next.setDate(next.getDate()+1);
        return [midnight, next];
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
