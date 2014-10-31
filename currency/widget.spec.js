describe("currencyLoader", function () {

});
describe("currency-plot", function () {
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
