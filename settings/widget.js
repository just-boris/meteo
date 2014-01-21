/*global define, require*/
define('Modal', ['angular', 'registry', 'weather', 'text!settings/modal.html'], function(angular, registry, weather, template) {
    "use strict";
    registry.controller('ModalController', function($scope, $http, city, widgets) {
        $scope.setEditing = function(editing) {
            $scope.editCity = editing;
            if(!editing) {
                city.set($scope.city);
            }
        };
        $scope.toggleWidget = function(widget) {
            widget.active = !widget.active;
            var widgetsList = widgets.getActive();
            if(widget.active) {
                widgetsList.push(widget.name);
            }
            else {
                widgetsList.splice(widgetsList.indexOf(widget.name), 1);
            }
            $scope.$parent.$broadcast('widgetsReorder', widgetsList);
        };
        var active = widgets.getActive();
        widgets.getAll().then(function(response) {
            $scope.widgets = response.map(function(widget) {
                return angular.extend({active: active.indexOf(widget.name) !== -1}, widget);
            });
        });
        city.get().then(function(response) {
            $scope.city = response;
        });
        $scope.$watch('city', function(name) {
            if(!name) {
                $scope.cities = [];
            }
            else {
                $http.get('http://api.openweathermap.org/data/2.5/find', {params: {
                    type:'like',
                    units: 'metric',
                    q: name
                }}).success(function(data) {
                    if(data.list) {
                        $scope.cities = data.list.map(function(c) {
                            return {
                                title: c.name+','+ c.sys.country,
                                id: c.id
                            };
                        });
                    }
                });
            }
        });
    });
    registry.factory('Modal', function($document, $timeout, $compile, $controller, $rootScope) {
        function Modal() {
            var self = this,
                body = $document.find('body').eq(0);
            this.backdrop = angular.element('<div class="modal_backdrop"></div>');
            body.append(this.backdrop);
            this.backdrop.on('click', this.close.bind(this));
            this.modal = angular.element('<div class="modal"></div>');
            body.append(this.modal);
            $timeout(function() {
                self.modal.addClass('slide_in');
            }, 20);
            this.modal.html(template);
            var scope = $rootScope.$new();
            $compile(this.modal)(scope);
            $controller('ModalController', {$scope: scope});
        }
        Modal.prototype.template = template;
        Modal.prototype.close = function() {
            this.backdrop.remove();
            this.modal.remove();
        };
        return Modal;
    });
});
define(['Modal'], function() {
    "use strict";
    return {
        className: 'add_more',
        template: '<div class="add_more" ng-click="openModal()"><div class="centered">'+
            '<span class="jumbotron fa fa-cogs"></span><br>'+
            '<h2>Change widgets</h2>'+
        '</div></div>',
        controller: function($scope, Modal) {
            $scope.openModal = function() {
                return new Modal($scope);
            };
        }
    };
});