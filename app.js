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
        function initDrag(element) {
            var position = element.getBoundingClientRect();
            d3.select(element).classed('widget__dragged', true)
                .style('left', window.pageXOffset+position.left+'px')
                .style('top', window.pageYOffset+position.top+'px');
            dragPlaceholder.dislodge(element);
            dragStarted = true;
        }
        var dragPlaceholder = new WidgetPlaceholder(container.node()),
            drag = d3.behavior.drag()
            .on('dragstart.draggable', function onDragStart() {
                dragStarted = false;
                dragPrevented = d3.event.sourceEvent.which !== 1;
            })
            .on('drag.draggable', function onDragWidget() {
                if(dragPrevented) {
                    return;
                }
                if(!dragStarted) {
                    initDrag(this);
                }
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
                if(dragStarted) {
                    container.node().insertBefore(this, dragPlaceholder.el);
                    dragPlaceholder.hide();
                    d3.select(this).classed('widget__dragged', false)
                        .style('left', null)
                        .style('top', null);
                }
            }),
            dragPrevented = false,
            dragStarted = false;
        return drag;
    };
});
define('app', ['d3', 'storage', 'Draggable'], function(d3, storage, Draggable) {
    "use strict";
    function Widget(name, json) {
        require([name+'/widget'], this.onLoad.bind(this));
        this.name = name;
        this.json = json;
        this.element = container.append('div').classed('widget', true);
        this.element.data([name]);
        this.element.append('div').classed('widget_close fa fa-times', true).on('click', this.remove.bind(this));
        this.element.call(drag);
    }
    Widget.prototype.onLoad = function(Factory) {
        var widgetCls = Factory.className;
        if(widgetCls) {
            this.element.classed(widgetCls, true);
        }
        new Factory(this.element.append('div').classed('widget_body', true), this.json);
    };
    Widget.prototype.remove = function() {
        this.element.remove();
    };
    var API_URL = "http://api.openweathermap.org/data/2.5/forecast?&mode=json&units=metric&q=",
        container = d3.select('.widgets'),
        drag = new Draggable(container),
        widgetNames = storage.getWidgets(),
        widgets = [],
        app = {};
    drag.on('dragend', function() {
        storage.setWidgets(container.selectAll('.widget').data());
    });
    storage.getCity(function(city) {
        d3.json(API_URL+city, function(error, json) {
            if (error) {
                console.warn(error);
                return;
            }
            function createWidget(name) {
                widgets.push(new Widget(name, json));
            }
            app.createWidget = function(name) {
                createWidget(name);
                widgetNames.push(name);
                storage.setWidgets(widgetNames);
            };
            app.removeWidget = function(name) {
                var widget = widgets.filter(function(w) {
                    return w.name === name;
                })[0];
                widgets.splice(widgets.indexOf(widget), 1);
                widget.remove();
                widgetNames.splice(widgetNames.indexOf(name), 1);
                storage.setWidgets(widgetNames);
            };
            widgetNames.forEach(createWidget);
        });
    });
    return app;
});