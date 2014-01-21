define(['angular', 'd3'], function(angular, d3) {
    "use strict";
    angular.module('meteoDraggable', []).directive('dragContainer', function() {
        return {
            controller: function($scope, $element) {
                function findWidgetAtXY(x, y) {
                    var el = document.elementFromPoint(x, y);
                    while(el && !el.hasAttribute('draggable')) {
                        el = el.parentNode;
                        if(!el.classList) {
                            return null;
                        }
                    }
                    return el;
                }
                function initDrag(element) {
                    var position = element.getBoundingClientRect();
                    d3.select(element).classed('widget__dragged', true)
                        .style('left', window.pageXOffset+position.left+'px')
                        .style('top', window.pageYOffset+position.top+'px');
                    dragPlaceholder.dislodge(element);
                    dragStarted = true;
                }
                var dragPlaceholder = new WidgetPlaceholder($element[0]),
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
                                $element[0].insertBefore(this, dragPlaceholder.el);
                                dragPlaceholder.hide();
                                d3.select(this).classed('widget__dragged', false)
                                    .style('left', null)
                                    .style('top', null);
                                $scope.$emit('widgetsReorder', d3.select($element[0]).selectAll('.widget').data());
                            }
                        }),
                    dragPrevented = false,
                    dragStarted = false;
                this.draggable = function(element) {
                    d3.select(element).call(drag);
                };
            }
        };
    }).directive('draggable', function() {
            return {
                require: '^dragContainer',
                link: function(scope, elm, attrs, DragCtrl) {
                    DragCtrl.draggable(elm[0]);
                }
            };
        });
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
});
