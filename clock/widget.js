define(function() {
    "use strict";
    return {
        template: '<h1 class="date">{{time | date:"EEE, d MMMM yyyy"}}</h1>' +
            '<div class="time centered jumbotron">{{time | date:"HH:mm"}}</div>',
        link: function(scope) {
            scope.time = new Date();
        },
        className: 'clock'
    };
});