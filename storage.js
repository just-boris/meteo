define(['localStorage'], function(storage) {
    var allWidgets = ['temp-now', 'temp-plot', 'clock', 'add-btn'];
    return {
        get: function() {
            var value = storage.getItem('widgets');
            return value ? JSON.parse(value) : allWidgets;
        },
        set: function(newWidgets) {
            storage.setItem('widgets', JSON.stringify(newWidgets));
        }
    }
});
