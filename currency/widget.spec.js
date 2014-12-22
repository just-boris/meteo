describe("currencyLoader", function () {
    var require, loader;

    beforeEach(function (done) {
        require = makeContext("currency");
        require(['currency/widget'], function () {
            require(['currencyLoader'], function(l) {
                loader = l;
                done();
            });
        })
    });

    beforeEach(function() {
        this.stub = sinon.stub($, "ajax", function() {
            return $.Deferred().resolve({
                "EUR to RUB": [
                    {"rate":"81.5893","date":"2014-12-16T05:00:00.000Z"},
                    {"rate":"81.5792","date":"2014-12-16T05:25:00.000Z"},

                    {"rate":"85.7825","date":"2014-12-16T07:06:00.000Z"},
                    {"rate":"91.4341","date":"2014-12-16T07:11:00.000Z"},
                    {"rate":"80.4972","date":"2014-12-16T07:23:00.000Z"},

                    {"rate":"84.8592","date":"2014-12-17T10:03:00.000Z"},
                    {"rate":"90.5209","date":"2014-12-17T10:04:00.000Z"},
                    {"rate":"79.9473","date":"2014-12-17T10:18:00.000Z"},
                    {"rate":"81.3898","date":"2014-12-17T10:25:00.000Z"},

                    {"rate":"74.9522","date":"2014-12-18T04:30:00.000Z"},
                    {"rate":"72.2332","date":"2014-12-18T04:40:00.000Z"},

                    {"rate":"75.8282","date":"2014-12-18T15:58:00.000Z"}
                ],
                "USD to RUB": [
                    {"rate":"51","date":"2014-12-18T07:00:00.000Z"},
                    {"rate":"52","date":"2014-12-18T07:30:00.000Z"}
                ]
            })
        });
    });

    it("should find average value in response", function (done) {
        loader.load(['EUR', 'USD']).done(function(results) {
            expect(results[0].values).to.have.length(5);
            expect(results[1].values).to.have.length(1);
            expect(results[1].values[0]).to.deep.equal({time: new Date(Date.UTC(2014, 11, 18, 7, 15)), value: 51.5});
            done();
        });
    });

    afterEach(function() {
        this.stub.restore();
    });
});
xdescribe("currency-plot", function () {
    var Widget, require, clock;

    beforeEach(function () {
        var spec = this;
        require = makeContext("currency");
        define('currencyLoader', function () {
            spec.currencyMock = {
                load: function () {
                    this.args = Array.prototype.slice.call(arguments, 0);
                    return $.Deferred();
                }
            };
            return spec.currencyMock;
        });
    });
    beforeEach(function (done) {
        require(['currency/widget'], function (w) {
            Widget = w;
            done();
        })
    });

    beforeEach(function () {
        clock = sinon.useFakeTimers(new Date(2014, 10, 15).getTime());
    });
    afterEach(function () {
        clock.restore();
    });



    it("should load data to plot", function () {
        var widget = new Widget();
        expect(this.currencyMock.args[0]).to.deep.equal(new Date(2014, 10, 8));
        expect(this.currencyMock.args[1]).to.deep.equal(new Date(2014, 10, 15));
    });
});
