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
        this.cityBlock = this.modal.select('.modal_city');
        this.editBtn = this.modal.select('.modal_edit').data([{editing: false}]).on('click', this.onEditCity.bind(this));
        this.modal.selectAll('.modal_widget .modal_button').data(this.widgetData).on('click', this.onToggleWidget.bind(this));
    };
    Modal.prototype.onEditCity = function(d) {
        var city;
        d.editing = !d.editing;
        this.editBtn.classed('fa-pencil', !d.editing).classed('fa-check', d.editing);
        if(d.editing) {
            city = this.cityBlock.html();
            this.cityBlock.html('<input type="text" value="'+city+'"/>');
        }
        else {
            city = this.cityBlock.select('input').node().value;
            this.cityBlock.html(city);
            storage.setCity(city);
            location.reload();
        }
    };
    Modal.prototype.onToggleWidget = function(d) {
        d.active = !d.active;
        if(d.active) {
            app.addWidget(d.name);
        }
        else {
            app.removeWidget(d.name);
        }
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
define(['d3', 'underscore', 'text!settings/widget.tpl.html'], function(d3, _, template) {
    "use strict";
    function SettingsBtn(element) {
        element.html(_.template(template, {}));
        element.on('click', function() {
            require(['Modal', 'weather'], function(Modal, weather) {
                weather.then(function(data) {
                    new Modal(data);
                });
            });
        });
    }
    SettingsBtn.className = 'add_more';
    return SettingsBtn;
});