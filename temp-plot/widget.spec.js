describe("temp-plot", function () {
    var Widget, require;
    beforeEach(function () {
        require = makeContext("temp-plot");
        var spec = this;
        define('weather', function () {
            spec.weatherMock = {
                register: function (elm, callback) {
                    this._callback = callback;
                }
            };
            return spec.weatherMock;
        });
    });
    beforeEach(function (done) {
        require(['temp-plot/widget'], function (w) {
            Widget = w;
            done();
        })
    });

    it("should provide a class name", function () {
        expect(Widget.className).to.equal('plot')
    });

    it("should create widget", function () {
        new Widget($('<div>'))
    });

    it("should load data to plot", function () {
        var widget = new Widget($('<div>'));
        this.weatherMock._callback({"list": [
                {
                    "dt": 1409605200,
                    "main": {"temp": 10.29},
                    "weather": [{"id": 801, "main": "Clouds", "description": "few clouds", "icon": "02n"}]
                },
                {
                    "weather": [{"id": 803,"main": "Clouds","description": "broken clouds","icon": "04d"}],
                    "main": {"temp": 16.18},
                    "dt": 1409670000
                },
                {
                    "weather": [{"id": 800,"main": "Clear","description": "sky is clear","icon": "01n"}],
                    "main": {"temp": 6.77},
                    "dt": 1409702400
                },
                {
                    "weather": [{"id": 801,"main": "Clouds","description": "few clouds","icon": "02n"}],
                    "main": {"temp": 10.87},
                    "dt": 1409864400
                },
                {
                    "weather": [{"id": 800,"main": "Clear","description": "sky is clear","icon": "01n"}],
                    "main": {"temp": 12.35},
                    "dt": 1410026400
                }
            ]}
        );

        //TODO: think about better matcher
        var expectDates = [
            new Date(2014, 8, 2, 12), new Date(2014, 8, 3),
            new Date(2014, 8, 3, 12), new Date(2014, 8, 4),
            new Date(2014, 8, 4, 12), new Date(2014, 8, 5),
            new Date(2014, 8, 5, 12), new Date(2014, 8, 6),
            new Date(2014, 8, 6, 12)
        ];
        widget.element.selectAll('.x.axis .tick').data().forEach(function(tick, i) {
            expect(tick, 'has correct date at '+i).to.deep.equal(expectDates[i]);
        });
    });


    it("should find the worst weather in interval", function() {
        var widget = new Widget($('<div>'));
        this.weatherMock._callback({"list": [
                {
                    "dt": 1409605200,
                    "main": {"temp": 6.77},
                    "weather": [{"id": 801, "main": "Clouds", "description": "few clouds", "icon": "02n"}]
                },
                {
                    "weather": [{"id": 803,"main": "Clouds","description": "broken clouds","icon": "04d"}],
                    "main": {"temp": 16.18},
                    "dt": 1409670000
                },
                {
                    "weather": [{"id": 800,"main": "Clear","description": "sky is clear","icon": "01n"}],
                    "main": {"temp": 14.78},
                    "dt": 1409702400
                },
                {
                    "weather": [{"id": 801,"main": "Clouds","description": "few clouds","icon": "02n"}],
                    "main": {"temp": 10.87},
                    "dt": 1409864400
                },
                {
                    "weather": [{"id":501,"main":"rain","description":"moderate rain","icon":"10d"}],
                    "main": {"temp": 12.35},
                    "dt": 1410026400
                }
            ]}
        );
        expect(widget.getWeatherOnInterval(1409605100000, 1410026400000)).to.deep.equal({
            time: 1410026400000,
            temp: 6.77,
            weather: {"id":501,"main":"rain","description":"moderate rain","icon":"10d"}
        });
        expect(widget.getWeatherOnInterval(1409660000000, 1409864400000)).to.deep.equal({
            time: 1409864400000,
            temp: 10.87,
            weather: {"id": 803,"main": "Clouds","description": "broken clouds","icon": "04d"}
        })
    });
});
