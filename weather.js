define(['jQuery', 'storage'], function($, storage) {
    return $.Deferred(function(deferred) {
        var API_URL = "http://api.openweathermap.org/data/2.5/forecast?&mode=json&units=metric&q=";
        storage.getCity(function(city) {
            $.getJSON(API_URL+city).then(function(response) {
                deferred.resolve(response);
            });
        });
    });
});
