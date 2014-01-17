/*global define, require*/
define('Modal', ['d3', 'underscore', 'storage', 'app', 'text!settings/modal.tpl.html'], function(d3, _, storage, app, template) {
    "use strict";
    function Modal(data) {
        this.backdrop = d3.select('body').append('div').classed('modal_backdrop', true);
        this.backdrop.on('click', this.close.bind(this));
        this.modal = d3.select('body').append('div').classed('modal', true);
        setTimeout(function() {
            this.modal.classed('slide_in', true);
        }.bind(this), 10);
        this.data = data;
        this.widgetData = this.mapWidgets();
        this.render();
    }
    Modal.prototype.render = function() {
        this.modal.html(_.template(template, {
            widgets: this.widgetData,
            city: this.data.city
        }));
        this.modal.selectAll('.modal_widget .modal_button').data(this.widgetData).on('click', this.onToggleWidget.bind(this));
    };
    Modal.prototype.onToggleWidget = function(d) {
        d.active = !d.active;
        if(d.active) {
            app.createWidget(d.name);
        }
        else {
            app.removeWidget(d.name);
        }
        this.render();
    };
    Modal.prototype.mapWidgets = function() {
        var active = storage.get();
        return storage.getAll().map(function(widget) {
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
define(['d3', 'underscore', 'Modal', 'text!settings/widget.tpl.html'], function(d3, _, Modal, template) {
    "use strict";
    function SettingsBtn(element, json) {
        element.html(_.template(template, {}));
        element.on('click', function() {
            new Modal(json);
        });
    }
    SettingsBtn.className = 'add_more';
    return SettingsBtn;
});