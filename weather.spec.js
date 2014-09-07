describe("weather service", function () {
    function FakeWidget() {
        this.callback = sinon.spy();
        this.element = $('<div/>');
    }
    var weather;
    beforeEach(function () {
        require = makeContext("weather service");
        var spec = this;
        define('city', function() {
            return spec.cityMock = {
                getCityName: function(callback) {
                    callback('test-ville');
                }
            }
        })
    });
    beforeEach(function (done) {
        require(['weather'], function (w) {
            weather = w;
            done();
        })
    });

    beforeEach(function() {
        this.server = sinon.fakeServer.create();
    });
    afterEach(function () {
        this.server.restore();
    });

    it("should register element and call callback on load", function () {
        this.server.respondWith("GET", "http://api.openweathermap.org/data/2.5/forecast?&mode=json&units=metric&q=test-ville",
            [200, { "Content-Type": "application/json" },
                '{"type": "kind a weather data"}']);
        var widget = new FakeWidget();
        weather.register(widget.element, widget.callback);
        this.server.respond();
        expect(widget.callback).to.have.been.calledOnce;
        expect(widget.callback).to.have.been.calledWith({"type": "kind a weather data"});
    });

    it("should load weather at once for all widgets", function () {
        var requestCount = 0;
        this.server.respondWith(function(xhr) {
            requestCount++;
            xhr.respond(200, null, '{"type": "kind a weather data"}');
        });
        var widgets = [new FakeWidget(), new FakeWidget()];
        weather.register(widgets[0].element, widgets[0].callback);
        weather.register(widgets[1].element, widgets[1].callback);
        this.server.respond();
        expect(requestCount).to.equal(1);
        expect(widgets[0].callback).to.have.been.calledOnce;
        expect(widgets[1].callback).to.have.been.calledOnce;
    });

    it("should reload weather after three update events", function () {
        var requestCount = 0;
        this.server.respondWith(function(xhr) {
            requestCount++;
            xhr.respond(200, null, '{"type": "kind a weather data"}');
        });
        var widgets = [new FakeWidget(), new FakeWidget()];
        weather.register(widgets[0].element, widgets[0].callback);
        weather.register(widgets[1].element, widgets[1].callback);
        this.server.respond();

        widgets[0].callback.reset();
        widgets[1].callback.reset();
        requestCount = 0;

        widgets[0].element.trigger('update');
        this.server.respond();
        expect(requestCount).to.equal(0);
        expect(widgets[0].callback).not.to.have.been.called;

        widgets[0].element.trigger('update');
        this.server.respond();
        expect(requestCount).to.equal(0);

        widgets[1].element.trigger('update');
        this.server.respond();
        expect(requestCount).to.equal(0);

        widgets[0].element.trigger('update');
        this.server.respond();
        expect(requestCount).to.equal(1);
        expect(widgets[0].callback).to.have.been.called;
        expect(widgets[1].callback).to.have.been.called;

        requestCount = 0;

        widgets[0].element.trigger('update');
        this.server.respond();
        expect(requestCount).to.equal(0);
        expect(widgets[0].callback).to.have.been.calledOnce;
        expect(widgets[1].callback).to.have.been.calledOnce;
    });
});
