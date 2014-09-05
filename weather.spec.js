describe("weather service", function () {
    var weather;
    beforeEach(function () {
        require = makeContext("weather service");
        var spec = this;
        define('city', function() {
            return spec.cityMock = {
                getCityName: sinon.spy()
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
        var callback = sinon.spy(),
            element = $('<div/>');
        weather.register(element, callback);
        this.cityMock.getCityName.firstCall.args[0]('test-ville');
        this.server.respond();
        expect(callback).to.have.been.calledOnce;
        expect(callback).to.have.been.calledWith({"type": "kind a weather data"});
    });
});
