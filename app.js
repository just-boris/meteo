/*global require, define */
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
define('app', ['d3', 'jQuery', 'storage', 'Draggable'], function(d3, $, storage, Draggable) {
    "use strict";
    function Widget(container, name) {
        require([name+'/widget'], this.onLoad.bind(this));
        this.name = name;
        this.container = container;
        this.element = $('<div></div>').appendTo(container).addClass('widget');
        this.element.data('name', name);
        $('<div>').appendTo(this.element).addClass('widget_close fa fa-times').on('click', this.onRemoveClick.bind(this));
    }
    Widget.prototype.onRemoveClick = function() {
        this.container.trigger('removeWidget', this.name);
    };
    Widget.prototype.onLoad = function(Factory) {
        var widgetCls = Factory.className;
        if(widgetCls) {
            this.element.addClass(widgetCls);
        }
        this.body = $('<div>').appendTo(this.element).addClass('widget_body');
        return new Factory(this.body);
    };
    Widget.prototype.remove = function() {
        this.element.remove();
    };
    function App(selector) {
        this.container = $(selector).first();
        this.container.on('addWidget', this.onAddWidget.bind(this))
            .on('removeWidget', this.onRemoveWidget.bind(this));
        this.drag = new Draggable(d3.select(this.container[0]));
        this.drag.on('dragend', this.onMoveWidgets.bind(this));
        this.widgetNames = storage.getWidgets();
        this.widgets = this.widgetNames.map(function(name) {
            return this.createWidget(name);
        }, this);
        window.setInterval(this.updateWidgets.bind(this), this.updateInterval);
    }
    App.prototype.updateInterval = 60000;
    App.prototype.onAddWidget = function(event, name) {
        this.addWidget(name);
    };
    App.prototype.onRemoveWidget = function(event, name) {
        this.removeWidget(name);
    };
    App.prototype.onMoveWidgets = function() {
        storage.setWidgets(this.container.find('.widget').map(function(i, el) {
            return $(el).data('name');
        }).toArray());
    };
    App.prototype.updateWidgets = function() {
        this.widgets.forEach(function(widget) {
            widget.body.trigger('update');
        });
    };
    App.prototype.createWidget = function(name) {
        var widget = new Widget(this.container, name);
        d3.select(widget.element[0]).call(this.drag);
        return widget;
    };
    App.prototype.addWidget = function(name) {
        this.widgets.push(this.createWidget(name));
        this.widgetNames.push(name);
        storage.setWidgets(this.widgetNames);
    };
    App.prototype.removeWidget = function(name) {
        var widget = this.widgets.filter(function(w) {
            return w.name === name;
        })[0];
        this.widgets.splice(this.widgets.indexOf(widget), 1);
        widget.remove();
        this.widgetNames.splice(this.widgetNames.indexOf(name), 1);
        storage.setWidgets(this.widgetNames);
    };
    return App;
});
