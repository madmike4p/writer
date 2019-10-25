var app = {
    initialize: function() {
        this.bindEvents();
    }, // end initialize

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    }, // end bindEvents
    
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    }, // onDeviceReady

    dbMessage: function(msg) {
    }, // end dbMessage

    receivedEvent: function(id) {
    } // receivedEvent
};