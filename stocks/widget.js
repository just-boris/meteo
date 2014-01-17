define([], function ($, highcharts) {
    function Stocks(element) {
        element.html('<img src="http://chart.finance.yahoo.com/z?s=YNDX&t=1w&q=l&l=on&z=l&c=GOOG&lang=ru-RU" style="width:100%"/>')
    };
    return Stocks;
});