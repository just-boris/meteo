/*global define*/
define(['d3', 'weather', 'weather-util', 'underscore', 'text!temp-plot/widget.tpl.html'], function(d3, weather, Util, _, template) {
    "use strict";
    function TemperaturePlot(element) {
        this.element = d3.select(element[0]);
        this.animateEnter = true;
        weather.register(element, this.onLoad.bind(this));
    }
    TemperaturePlot.prototype.onLoad = function(data) {
        var self = this,
            opts = {margin: {left: 40, right: 20, top: 40, bottom: 70}, width: 540, height: 300};
        this.dayInfoTpl = _.template(template);
        this.element.html('');
        this.svg = this.element.append("svg").attr("width", opts.width + opts.margin.left + opts.margin.right)
            .attr("height", opts.height + opts.margin.top + opts.margin.bottom);
        this.plot = this.svg.append("g").attr("transform", "translate(" + opts.margin.left + "," + opts.margin.top + ")");
        this.data = this.mapData(data);
        var tempBounds = d3.extent(this.data, function(d) { return d.temp; });
        var x = d3.time.scale().range([0, opts.width]).domain(d3.extent(this.data, function(d) { return d.time; })),
            y = d3.scale.linear().range([opts.height, 0]).domain(tempBounds).nice();

        var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(d3.time.hours, 12).tickFormat("");
        var yAxis = d3.svg.axis().scale(y).orient("left");

        this.plot.append("g").attr("class", "x axis").attr("transform", "translate(0," + opts.height + ")").call(xAxis);
        this.plot.append("g").attr("class", "y axis").call(yAxis)
            .append("text")
            .attr("x", -10)
            .attr('y', -20)
            .attr("dy", ".25em")
            .text("°C");
        var tickInterval = x.range()[1]/x.ticks.apply(x, xAxis.ticks()).length,
            ticks = this.plot.selectAll('.x.axis .tick').data();
        this.plot.selectAll('.x.axis .tick').append('switch').append('foreignObject').attr({
            y: 6,
            x: -tickInterval/2,
            width: tickInterval,
            height: 60
        }).append('xhtml:body').attr('xmlns', "http://www.w3.org/1999/xhtml").html(function(d) {
            var data = self.getWeatherOnInterval(ticks[ticks.indexOf(d)-1], d);
            return self.dayInfoTpl(_.extend({}, data, {
                temp: Util.formatTemp(data.temp),
                time: d3.time.format('%H:%M')(d),
                date: d.getHours() == 0 ? d3.time.format('%_d&nbsp;%b')(d) : '&nbsp;',
                cloudIcon: Util.getCloudIcon(data.weather)
            }));
        });

        if(tempBounds[0]*tempBounds[1] < 0) {
            this.plot.append('line').attr({
                x1: x.range()[0], y1: y(0),
                x2: x.range()[1], y2: y(0)
            });
        }

        this.createGradient('pathFill', this.getColorStops(tempBounds[0], tempBounds[1]));
        var line = d3.svg.line()
                .x(function(d) {
                    return x(d.time);
                })
                .y(y(tempBounds[1])),
            path = this.plot.append("path")
                .datum(this.data)
                .attr("class", "line").style('stroke', 'url(#pathFill)')
                .attr("d", line);

        line.y(function(d) {
            return y(d.temp);
        });
        if(this.animateEnter) {
            path = path.transition().duration(1000);
            this.animateEnter = false;
        }
        path.attr('d', line);
    };
    TemperaturePlot.prototype.mapData = function(rawData) {
        return rawData.hourly.data.map(function(d) {
            return {
                weather: d.icon,
                summary: d.summary,
                time: d.time*1000,
                temp: d.temperature
            };
        });
    };
    TemperaturePlot.prototype.getWeatherOnInterval = function(from, to) {
        var data = this.data.filter(function(d) {
                return (!from || d.time > from.valueOf())
                    && d.time <= to.valueOf();
            }),
            result = {time: to.valueOf()};
        if(data.length > 0) {
            var worst = Util.getWorstWeather(data);
            result.weather = worst.weather;
            result.summary = worst.summary;
            result.temp = Math.min.apply(null, data.map(function(w) {
                return w.temp;
            }));
        }
        return result;
    };
    TemperaturePlot.prototype.getColorStops = function(min, max) {
        var stops = {0: this.getColor(max), 100: this.getColor(min)};
        if(max*min<0) {
            var zeroOffset = (max*100)/(max-min);
            stops[zeroOffset-10] = '#c8a2ce';
            stops[zeroOffset+10] = '#6bcbe6';
        }
        return stops;
    };
    TemperaturePlot.prototype.getColor = function(temp) {
        if(temp > 0) {
            return d3.interpolateRgb('#c8a2ce', '#ec1000')(temp/30);
        }
        else {
            return d3.interpolateRgb('#6bcbe6', '#2b78d8')(-temp/30);
        }
    };
    TemperaturePlot.prototype.createGradient = function(name, stops) {
        var gradient = this.svg.append("svg:defs").append("svg:linearGradient")
            .attr("id", name)
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%")
            .attr("spreadMethod", "pad");
        _.chain(stops).keys().sortBy(function(offset) {
            return parseFloat(offset);
        }).each(function(offset) {
            gradient.append("svg:stop")
                .attr("offset", offset+"%")
                .attr("stop-color", stops[offset])
                .attr("stop-opacity", 1);
        });
    };
    TemperaturePlot.className = 'plot';
    return TemperaturePlot;
});
