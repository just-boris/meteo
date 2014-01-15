/*global requirejs, require, define */
requirejs.config({
    paths: {
        d3: '//cdnjs.cloudflare.com/ajax/libs/d3/3.3.13/d3.min',
        underscore: '//yandex.st/underscore/1.5.2/underscore-min',
        text: '//cdnjs.cloudflare.com/ajax/libs/require-text/2.0.10/text'
    },
    shim: {
        underscore: { exports: '_' },
        d3: { exports: 'd3' }
    }
});
define('localStorage', [], function() {
    "use strict";
    return window.localStorage;
});
define('Draggable', ['d3'], function(d3) {
    "use strict";
    function WidgetPlaceholder(container) {
        this.container = container;
        this.el = document.createElement('div');
        this.el.className = 'widget_placeholder';
    }
    WidgetPlaceholder.prototype.hide = function() {
        this.el.style.display = 'none';
    };
    WidgetPlaceholder.prototype.dislodge = function(widgetEl) {
        if(widgetEl.previousSibling !== this.el) {
            this.container.insertBefore(this.el, widgetEl);
        }
        else {
            this.container.insertBefore(this.el, widgetEl.nextSibling);
        }
        this.el.style.display = 'block';
    };
    function findWidgetAtXY(x, y) {
        var el = document.elementFromPoint(x, y);
        while(el && !el.classList.contains('widget')) {
            el = el.parentNode;
            if(!el.classList) {
                return null;
            }
        }
        return el;
    }
    return function(container) {
        var dragPlaceholder = new WidgetPlaceholder(container.node());
        return d3.behavior.drag()
            .on('dragstart.draggable', function onDragStart() {
                var position = this.getBoundingClientRect();
                d3.select(this).classed('widget__dragged', true)
                    .style('left', window.pageXOffset+position.left+'px')
                    .style('top', window.pageYOffset+position.top+'px');
                dragPlaceholder.dislodge(this);
            })
            .on('drag.draggable', function onDragWidget() {
                this.style.display = "none";
                var el = d3.select(this),
                    left = parseFloat(el.style('left'))+d3.event.dx,
                    top = parseFloat(el.style('top'))+d3.event.dy,
                    widgetOver = findWidgetAtXY(left, top);
                if(widgetOver) {
                    dragPlaceholder.dislodge(widgetOver);
                }
                this.style.display = "block";
                el.style({
                    left: left+'px',
                    top: top+'px'
                });
            })
            .on('dragend.draggable', function onDragEnd() {
                container.node().insertBefore(this, dragPlaceholder.el);
                dragPlaceholder.hide();
                d3.select(this).classed('widget__dragged', false)
                    .style('left', null)
                    .style('top', null);
            });
    };
});
require(['d3', 'storage', 'Draggable'], function(d3, storage, Draggable) {
    "use strict";
    function Widget(name, WidgetFactory, json) {
        var widget = container.append('div').classed('widget', true),
            widgetCls = WidgetFactory.className;
        if(widgetCls) {
            widget.classed(widgetCls, true);
        }
        widget.data([name]);
        widget.append('div').classed('widget_close fa fa-times', true);
        new WidgetFactory(widget.append('div').classed('widget_body', true), json);
        widget.call(drag);
    }
    var API_URL = "http://api.openweathermap.org/data/2.5/forecast?q=Saint%20Petersburg&mode=json&units=metric",
        container = d3.select('.widgets'),
        drag = new Draggable(container),
        widgetNames = storage.get();
    drag.on('dragend', function() {
        storage.set(container.selectAll('.widget').data());
    });
    require(widgetNames.map(function(name) {
        return name+'/widget';
    }), function() {
        var widgets = Array.prototype.slice.call(arguments, 0);
        d3.json(API_URL, function(error, json) {
            if (error) {
                console.warn(error);
                return;
            }
            widgets.forEach(function(WidgetFactory, index) {
                new Widget(widgetNames[index], WidgetFactory, json);
            });
        });
    });

});