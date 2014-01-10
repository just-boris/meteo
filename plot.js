window.Plot = (function(d3) {
    function extend(dest) {
        var args = Array.prototype.slice.call(arguments, 1);
        args.forEach(function(src) {
            for(var key in src) {
                if(src.hasOwnProperty(key)) {
                    var item = src[key];
                    if(typeof item === 'Object') {
                        dest[key] = extend(dest[key] || {}, item);
                    } else {
                        dest[key] = src[key];
                    }

                }
            }
        });
        return dest;
    }
    function Plot(data, element, options) {
        var opts = extend({}, options, {margin: {left: 40, right: 40, top: 40, bottom: 100}});
        this.svg = element.append("svg").attr("width", opts.width + opts.margin.left + opts.margin.right)
            .attr("height", opts.height + opts.margin.top + opts.margin.bottom);
        this.plot = this.svg.append("g").attr("transform", "translate(" + opts.margin.left + "," + opts.margin.top + ")");
        var tempBounds = d3.extent(data, function(d) { return d.temp; });
        var x = d3.time.scale().range([0, opts.width]).domain(d3.extent(data, function(d) { return d.time; })),
            y = d3.scale.linear().range([opts.height, 0]).domain(tempBounds).nice();

        var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format('%H:%M'));
        var yAxis = d3.svg.axis().scale(y).orient("left");

        this.plot.append("g").attr("class", "x axis").attr("transform", "translate(0," + opts.height + ")").call(xAxis);
        this.plot.append("g").attr("class", "y axis").call(yAxis)
            .append("text")
            .attr("x", -10)
            .attr('y', -20)
            .attr("dy", ".25em")
            .text("°C");

        this.plot.selectAll('.x.axis .tick').append('text').attr({
            'y': 27,
            'dy': '.71em'
        }).style({
            'text-anchor': 'middle'
        }).text(function(d) {
            return d3.time.format('%_d %b')(d);
        });
        this.plot.selectAll('.x.axis .tick').append('image').attr({
            y: 35,
            x: -25,
            width: 50,
            height: 50,
            'xlink:href': function(d, i) {
                return 'http://openweathermap.org/img/w/'+data[i].clouds+'.png';
            }
        });

        this.plot.append('line').attr({
            x1: x.range()[0], y1: y(0),
            x2: x.range()[1], y2: y(0)
        });

        var line = d3.svg.line()
            .x(function(d) {
                return x(d.time);
            })
            .y(y(tempBounds[1]));

        this.createGradient('pathFill', this.getColorStops.apply(this, y.domain().slice(0)));
        var path = this.plot.append("path")
            .datum(data)
            .attr("class", "line").style('stroke', 'url(#pathFill)')
            .attr("d", line);

        line.y(function(d) {
            return y(d.temp);
        });
        path.transition().duration(1000).attr('d', line);

        this.plot.append('text').classed('title', true).text(opts.title).attr({x: opts.width/2});
    }
    Plot.prototype.colors = ['#ec1000', '#ffa59d', '#2b78d8'];
    Plot.prototype.getColorStops = function(min, max) {
        if(max*min>0) {
            return [this.getColor(max), this.getColor(min)]
        }
        else {
            return [this.getColor(max), this.getColor(0), this.getColor(min)]
        }
    };
    Plot.prototype.getColor = function(temp) {
        if(temp > 0) {
            return d3.interpolateRgb(this.colors[0], this.colors[1])(temp/100)
        }
        else {
            return d3.interpolateRgb(this.colors[2], this.colors[1])(-temp/100)
        }
    };
    Plot.prototype.createGradient = function(name, stops) {
        var gradient = this.svg.append("svg:defs").append("svg:linearGradient")
            .attr("id", name)
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%")
            .attr("spreadMethod", "pad");
        stops.forEach(function(stop, index) {
            gradient.append("svg:stop")
                .attr("offset", (index/(stops.length-1)*100)+"%")
                .attr("stop-color", stop)
                .attr("stop-opacity", 1);
        });
    };

    return Plot;
})(d3);