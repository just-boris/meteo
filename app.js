/*global requirejs, require, define */
requirejs.config({
    paths: {
        angular: '//ajax.googleapis.com/ajax/libs/angularjs/1.2.9/angular',
        storage: 'vendor/storageprovider',
        d3: '//cdnjs.cloudflare.com/ajax/libs/d3/3.3.13/d3.min',
        underscore: '//yandex.st/underscore/1.5.2/underscore-min',
        text: '//cdnjs.cloudflare.com/ajax/libs/require-text/2.0.10/text'
    },
    shim: {
        angular: {exports: 'angular'},
        underscore: { exports: '_' },
        d3: { exports: 'd3' }
    }
});
define('app', ['angular', 'widget', 'widgetsStore', 'registry', 'draggable'], function(angular, storage, registry, draggable) {
    "use strict";
    angular.module('meteoApp', ['meteoWidget', 'meteoWidgetStore', 'meteoDraggable', 'meteoRegistry'])
        .config(function($httpProvider) {
            $httpProvider.defaults.cache = true;
        })
        .controller('AppCtrl', function($scope, widgets) {
        $scope.widgets = widgets.getActive();
        $scope.$on('widgetsReorder', function(event, widgetList) {
            $scope.widgets = widgetList;
            widgets.setActive(widgetList);
        });
    });
    angular.bootstrap(document.body, ['meteoApp']);
});
define('widgetsStore', ['angular', 'storage'], function(angular, storage) {
    "use strict";
    angular.module('meteoWidgetStore', ['localStorageModule']).factory('widgets', function($storage) {
        var store = $storage('widgets'),
            allWidgets = [
                {name: 'temp-now', title: 'Temperature now', description: 'Shows current weather and temperature'},
                {name: 'temp-plot', title: 'Temperature forecast', description: 'Weather forecast for the next 3 days'},
                {name: 'clock', title: 'Digital clock', description: 'Date and time now'}
            ];
        return {
            getAll: function() {
                return allWidgets;
            },
            getActive: function() {
                return store.getItem('list') || allWidgets.map(function(w) { return w.name; }).concat('settings');
            },
            setActive: function(list) {
                store.setItem('list', list);
            }
        };
    });
});
define('registry', ['angular'], function(angular) {
    "use strict";
    var $compileProvider, $controllerProvider, $filterProvider, $provide;
    angular.module('meteoRegistry', []).config(function(_$compileProvider_, _$controllerProvider_, _$filterProvider_, _$provide_) {
        $controllerProvider = _$controllerProvider_;
        $compileProvider = _$compileProvider_;
        $filterProvider = _$filterProvider_;
        $provide = _$provide_;
    });
    return {
        directive: function() {
            $compileProvider.directive.apply($compileProvider, arguments);
            return this;
        },
        value: function() {
            $provide.value.apply($provide, arguments);
            return this;
        },
        factory: function() {
            $provide.factory.apply($provide, arguments);
            return this;
        },
        controller: function() {
            $controllerProvider.register.apply($controllerProvider, arguments);
            return this;
        },
        filter: function() {
            $filterProvider.register.apply($filterProvider, arguments);
            return this;
        }
    };
});
define('widget', ['angular', 'registry', 'd3'], function(angular, registry, d3) {
    "use strict";
    angular.module('meteoWidget', []).directive('widget', function($compile, $rootScope) {
        var loadedWidgets = {};
        function loadWidget(name, callback) {
            if(!loadedWidgets[name]) {
                require([name+'/widget'], function(Factory) {
                    registry.directive(name.replace(/-(.)/g, function($0, $1) {return $1.toUpperCase();}), function() {
                        if(angular.isFunction(Factory)) {
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
            link: function(scope, elm, attrs) {
                elm = d3.select(elm[0]);
                var name = attrs.widget;
                elm.data([name]);
                loadWidget(name, function(Factory) {
                    var widgetCls = Factory.className;
                    if(widgetCls) {
                        elm.classed(widgetCls, true);
                    }
                    var body = elm.append(name).classed('widget_body', true).node();
                    $compile(body)(scope);
                });
            }
        };
    });
});