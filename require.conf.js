requirejs.config({
    paths: {
        d3: '//cdnjs.cloudflare.com/ajax/libs/d3/3.3.13/d3.min',
        underscore: '//yandex.st/underscore/1.5.2/underscore-min',
        jQuery: 'http://yandex.st/jquery/2.1.0/jquery.min',
        text: '//cdnjs.cloudflare.com/ajax/libs/require-text/2.0.10/text',
        moment: 'http://momentjs.com/downloads/moment',
        json: 'vendor/require-json',
        suncalc: 'vendor/suncalc'
    },
    shim: {
        jQuery: {exports: 'jQuery'},
        underscore: { exports: '_' },
        d3: { exports: 'd3' }
    }
});
//provide localStorage service
define('localStorage', [], function() {
    "use strict";
    return window.localStorage;
});