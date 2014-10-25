/*global define*/
define('currencyLoader', ['jQuery', 'moment'], function ($, moment) {
    var API_TOKEN = '4e64beff93d94e4c92078a4e6997eaa8',
        BASE_URL = 'https://openexchangerates.org/api/historical/';
    return {
        load: function(dateFrom, dateTo, series) {
            dateFrom = moment(dateFrom);
            var requests = [];
            while(dateFrom < dateTo) {
                var request = $.ajax(BASE_URL+dateFrom.format('YYYY-MM-DD')+'.json?app_id='+API_TOKEN).pipe(function(response) {
                    var base = response.rates['RUB'],
                        result = {
                            time: response.timestamp*1000
                        };
                    series.forEach(function(label) {
                        result[label] = base/response.rates[label];
                    });
                    return result;
                });
                requests.push(request);
                dateFrom.add(1, 'days');
            }
            return $.when.apply($, requests);
        }
    }
});
define(['d3', 'currencyLoader'], function(d3, currencyLoader) {
    "use strict";
    function CurrencyPlot(element) {
        this.element = element;
        var self = this,
            dateTo = new Date(),
            dateFrom = new Date(dateTo.getTime()-1000*3600*24*7);
        currencyLoader.load(dateFrom, dateTo, self.series).done(function() {
            var results = Array.prototype.slice.call(arguments),
                data = self.series.map(function(label) {
                    return {
                        label: label,
                        values: results.map(function(day) {
                            return {time: day.time, value: day[label]}
                        })
                    };
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
