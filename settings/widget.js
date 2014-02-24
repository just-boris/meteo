/*global define, require*/
define('Modal', ['d3', 'underscore', 'storage', 'text!settings/modal.tpl.html'], function(d3, _, storage, template) {
    "use strict";
    function Modal(container) {
        this.container = container;
        this.backdrop = d3.select('body').append('div').classed('modal_backdrop', true);
        this.backdrop.on('click', this.close.bind(this));
        this.modal = d3.select('body').append('div').classed('modal', true);
        setTimeout(function() {
            this.modal.classed('slide_in', true);
        }.bind(this), 10);
        this.widgetData = this.mapWidgets();
        this.render();
    }
    Modal.prototype.render = function() {
        this.modal.html(_.template(template, {
            widgets: this.widgetData
        }));
        this.modal.selectAll('.modal_widget .modal_button').data(this.widgetData).on('click', this.onToggleWidget.bind(this));
    };
    Modal.prototype.onToggleWidget = function(d) {
        d.active = !d.active;
        this.container.trigger(d.active ? 'addWidget' : 'removeWidget', d.name);
        this.render();
    };
    Modal.prototype.mapWidgets = function() {
        var active = storage.getWidgets();
        return storage.getAllWidgets().map(function(widget) {
            return _.extend({
                active: active.indexOf(widget.name) !== -1
            }, widget);
        });
    };
    Modal.prototype.close = function() {
        this.backdrop.remove();
        this.modal.remove();
    };
    return Modal;
});
define(['underscore', 'text!settings/widget.tpl.html'], function(_, template) {
    "use strict";
    function SettingsBtn(element) {
        var container = element.parent('.widget').parent();
        element.html(_.template(template, {}));
        element.on('click', function() {
            require(['Modal', 'weather'], function(Modal) {
                  new Modal(container);
            });
        });
    }
    SettingsBtn.className = 'add_more';
    return SettingsBtn;
});