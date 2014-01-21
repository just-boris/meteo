/*global requirejs, require, angular, d3 */
requirejs.config({
    paths: {
        text: '//cdnjs.cloudflare.com/ajax/libs/require-text/2.0.10/text'
    }
});
angular.module('meteoApp', ['meteoWidget', 'meteoWidgetStore', 'meteoDraggable', 'meteoRegistry'])
.config(function ($httpProvider) {
    "use strict";
    $httpProvider.defaults.cache = true;
})
.controller('AppCtrl', function ($scope, widgets) {
    "use strict";
    $scope.widgets = widgets.getActive();
    $scope.$on('widgetClose', function (event, widgetName) {
        $scope.widgets.splice($scope.widgets.indexOf(widgetName), 1);
        widgets.setActive($scope.widgets);
    });
    $scope.$on('widgetsReorder', function (event, widgetList) {
        $scope.widgets = widgetList;
        widgets.setActive(widgetList);
    });
});
angular.module('meteoWidgetStore', ['localStorageModule']).factory('widgets', function ($http, $storage) {
    "use strict";
    var store = $storage('widgets'),
        defaultWidgets = ['temp-now', 'temp-plot', 'clock', 'settings'];
    return {
        getAll: function () {
            return $http.get('widgets.json').then(function (response) {
                return response.data;
            });
        },
        getActive: function () {
            return store.getItem('list') || defaultWidgets;
        },
        setActive: function (list) {
            store.setItem('list', list);
        }
    };
});
angular.module('meteoRegistry', []).provider('registry', function ($compileProvider, $controllerProvider, $filterProvider, $provide) {
    "use strict";
    this.$get = function ($window) {
        $window.registry = {
            directive: function () {
                $compileProvider.directive.apply($compileProvider, arguments);
                return this;
            },
            value: function () {
                $provide.value.apply($provide, arguments);
                return this;
            },
            factory: function () {
                $provide.factory.apply($provide, arguments);
                return this;
            },
            controller: function () {
                $controllerProvider.register.apply($controllerProvider, arguments);
                return this;
            },
            filter: function () {
                $filterProvider.register.apply($filterProvider, arguments);
                return this;
            }
        };
        return $window.registry;
    };
});
angular.module('meteoWidget', []).directive('widget', function ($compile, $rootScope, registry) {
    "use strict";
    var loadedWidgets = {};
    function loadWidget(name, callback) {
        if (!loadedWidgets[name]) {
            require([name + '/widget'], function (Factory) {
                registry.directive(name.replace(/-(.)/g, function ($0, $1) {
                    return $1.toUpperCase();
                }), function () {
                    if (angular.isFunction(Factory)) {
                        Factory = {link: Factory};
                    }
                    return angular.extend(Factory, {restrict: 'E'});
                });
                loadedWidgets[name] = Factory;
                callback(Factory);
                $rootScope.$apply();
            });
        }
        else {
            callback(loadedWidgets[name]);
        }
    }
    return {
        replace: true,
        template: '<div class="widget">' +
            '<div class="widget_close fa fa-times" ng-click="closeWidget()"></div>'+
            '</div>',
        scope: {},
        link: function (scope, elm, attrs) {
            elm = d3.select(elm[0]);
            var name = attrs.widget;
            elm.data([name]);
            loadWidget(name, function (Factory) {
                var widgetCls = Factory.className;
                if (widgetCls) {
                    elm.classed(widgetCls, true);
                }
                var body = elm.append(name).classed('widget_body', true).node();
                $compile(body)(scope);
            });
            scope.closeWidget = function () {
                scope.$emit('widgetClose', name);
            };
        }
    };
});