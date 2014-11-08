/*global define*/
define('currencyLoader', ['jQuery', 'moment'], function ($, moment) {
    var BASE_URL = 'http://currency.webogram.org/rates/';
    return {
        load: function(series) {
            return $.ajax(BASE_URL+series.join(','), {dataType: "jsonp"});
        }
    }
});
define(['d3', 'currencyLoader'], function(d3, currencyLoader) {
    "use strict";
    function CurrencyPlot(element) {
        this.element = element;
        var self = this;
        currencyLoader.load(this.series).done(function(results) {
            var data = self.series.map(function(serie) {
                return {
                    label: serie,
                    values: results[serie + ' to RUB'].map(function(value) {
                        return {time: new Date(value.date), value: value.rate}
                    })
                }
            });
            self.onLoad(data);
        });
    }
    CurrencyPlot.prototype.onLoad = function(data) {
        var self = this,
            opts = {margin: {left: 40, right: 20, top: 40, bottom: 40}, width: 540, height: 300};
        this.element.html('');
        this.svg = d3.select(this.element[0]).append("svg").attr("width", opts.width + opts.margin.left + opts.margin.right)
            .attr("height", opts.height + opts.margin.top + opts.margin.bottom);
        this.plot = this.svg.append("g").attr("transform", "translate(" + opts.margin.left + "," + opts.margin.top + ")");

        var x = d3.time.scale().range([0, opts.width]).domain(d3.extent(data[0].values, function(d) {return d.time;})),
            y = d3.scale.linear().range([opts.height, 0]).domain(this.getValuesExent(data)).nice();

        var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(d3.time.day, 1).tickFormat(d3.time.format("%d/%m")),
            yAxis = d3.svg.axis().scale(y).orient("left");

        this.plot.append("g").attr("class", "x axis").attr("transform", "translate(0," + opts.height + ")").call(xAxis);
        this.plot.append("g").attr("class", "y axis").call(yAxis);


        var line = d3.svg.line()
                .x(function(d) {
                    return x(d.time);
                })
                .y(y.range()[0]),
            path = this.plot.selectAll('.line').data(data).enter().append('path')
                .attr("class", "line")
                .style('stroke', function(d) {
                    return self.seriesColors[d.label];
                })
                .attr("d", function(d){
                    return line(d.values);
                });

        line.y(function(d) {
            return y(d.value);
        });
        path.transition().duration(1000).attr("d", function(d){
            return line(d.values);
        });
    };
    CurrencyPlot.prototype.getValuesExent = function(data) {
        var values = data.reduce(function(total, serie) {
            return total.concat(serie.values);
        }, []);
        return d3.extent(values, function(d) {
            return d.value;
        })
    };
    CurrencyPlot.prototype.series = ['EUR', 'USD'];
    CurrencyPlot.prototype.seriesColors = {
        'EUR': '#BD2400',
        'USD': '#85BB65'
    };
    CurrencyPlot.className = 'currency plot';
    return CurrencyPlot;
});
