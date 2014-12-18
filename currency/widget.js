/*global define*/
define('currencyLoader', ['jQuery'], function ($) {
    var BASE_URL = 'http://currency.webogram.org/rates/';
    return {
        load: function(series) {
            return $.ajax(BASE_URL+series.join(','), {dataType: "jsonp"});
        }
    }
});
define(['d3', 'jQuery', 'underscore', 'currencyLoader', 'text!currency/widget.tpl.html'], function(d3, $, _, currencyLoader, template) {
    "use strict";
    function CurrencyPlot(element) {
        this.element = element;
        this.makeTemplate = _.template(template);
        var self = this;
        currencyLoader.load(this.series).done(function(results) {
            var data = self.series.map(function(serie) {
                return {
                    label: serie,
                    values: results[serie + ' to RUB'].map(function(value) {
                        return {time: new Date(value.date), value: parseFloat(value.rate)}
                    })
                }
            });
            self.onLoad(data);
        });
    }
    CurrencyPlot.prototype.onLoad = function(data) {
        var self = this,
            opts = this.opts = {margin: {left: 40, right: 20, top: 40, bottom: 40}, width: 540, height: 300};
        this.data = data;
        this.element.html('');
        this.svg = d3.select(this.element[0]).append("svg").attr("width", opts.width + opts.margin.left + opts.margin.right)
            .attr("height", opts.height + opts.margin.top + opts.margin.bottom);
        this.plot = this.svg.append("g").attr("transform", "translate(" + opts.margin.left + "," + opts.margin.top + ")");
        this.svg.on('mousemove.currency', this.updateTooltip.bind(this))
            .on('mouseleave.currency', this.removeTooltip.bind(this));
        var x = this.x = d3.time.scale().range([0, opts.width]).domain(d3.extent(data[0].values, function(d) {return d.time;})),
            y = this.y = d3.scale.linear().range([opts.height, 0]).domain(this.getValuesExent(data)).nice();

        var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(d3.time.day, 1).tickFormat(d3.time.format("%d/%m")),
            yAxis = d3.svg.axis().scale(y).orient("left");

        this.plot.append("g").attr("class", "x axis").attr("transform", "translate(0," + opts.height + ")").call(xAxis);
        this.plot.append("g").attr("class", "y axis").call(yAxis);

        this.series.forEach(function(serie) {
            this.generateGradient('currency'+serie, this.seriesColors[serie]);
        }, this);

        var line = d3.svg.line()
                .x(function(d) {
                    return x(d.time);
                })
                .y(y.range()[0]),
            path = this.plot.selectAll('.line').data(data).enter().append('path')
                .attr("class", "line")
                .style({
                    stroke: function(d) {
                        return self.seriesColors[d.label];
                    },
                    fill: function(d) {
                        return 'url(#currency' + d.label + ')'
                    }
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
    CurrencyPlot.prototype.removeTooltip = function() {
        if(this.rule) {
            this.rule.remove();
            delete this.rule;
            this.tooltip.remove();
            delete this.tooltip;
        }
    };
    CurrencyPlot.prototype.updateTooltip = function() {
        var x = d3.event.offsetX - this.opts.margin.left,
            range = this.x.range();
        if(x > range[0] && x < range[1]) {
            if(!this.rule) {
                this.rule = this.plot.append('line').attr({
                    y1: 0,
                    y2: this.y.range()[0]
                });
                this.tooltip = $('<div class="tooltip"></div>').appendTo('body');
            }
            this.rule.attr({
                x1: x,
                x2: x
            });
            var data = this.getValueFromDate(this.x.invert(x));
            if(data) {
                this.tooltip.html(this.makeTemplate({data: data, colors: this.seriesColors }));
            }
            this.tooltip.css({
                left: d3.event.pageX+10,
                top: d3.event.pageY+10
            })
        } else {
            this.removeTooltip();
        }

    };
    CurrencyPlot.prototype.getValueFromDate = function(date) {
        return this.data.map(function(serie) {
            return _.extend({label: serie.label}, serie.values.reduce(function(result, value) {
                return value.time < date ? value : result;
            }));
        })
    };
    CurrencyPlot.prototype.getValuesExent = function(data) {
        var values = data.reduce(function(total, serie) {
            return total.concat(serie.values);
        }, []);
        return d3.extent(values, function(d) {
            return d.value;
        })
    };
    CurrencyPlot.prototype.generateGradient = function(name, color) {
        this.svg.append('defs')
            .append('linearGradient')
                .attr({
                    id: name,
                    spreadMethod: 'pad',
                    x1: "0%",
                    y1: "0%",
                    x2: "0%",
                    y2: "100%"
                }).selectAll('stop').data([0.3, 0]).enter()
            .append('stop')
                .attr({
                    offset: function(d, i) {
                        return i*75+'%'
                    },
                    'stop-color': color,
                    'stop-opacity': function(d) {return d}
                });
    };
    CurrencyPlot.prototype.series = ['EUR', 'USD'];
    CurrencyPlot.prototype.seriesColors = {
        'EUR': '#BD2400',
        'USD': '#85BB65'
    };
    CurrencyPlot.className = 'currency plot';
    return CurrencyPlot;
});
