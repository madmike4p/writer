var app = {
    initialize: function() {
      this.bindEvents();
    }, // end initialize

    bindEvents: function() {
      document.addEventListener('deviceready', this.onDeviceReady, false);

      document.getElementById('readPonsButton').addEventListener('click', this.readPons, false);
      console.log(document.getElementById('readPonsButton'));
    }, // end bindEvents
    
    onDeviceReady: function() {
      app.receivedEvent('deviceready');
      console.log('in onDeviceReady');
    }, // onDeviceReady

    readPons: function(event) {
      console.log('inReadPons');
      var address = 'https://pl.pons.com/t%C5%82umaczenie?q=secondly&l=enpl&in=&lf=en&qnac=';

$.ajax({
    type: 'GET',
    url: address,
    dataType: 'html',
    success: function(xmlDoc) {
        alert(typeof xmlDoc);
    }
});


      /*
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          //alert(this.responseText);
          text = this.response;
          alert(text);
          var parser = new window.DOMParser();
          alert(parser);
          var doc = parser.parseFromString('<p>dupa</p>', 'text/html');
          //var results = doc.querySelectorAll('div.results');
          var x = Object.getOwnPropertyNames(doc);
          alert(x);

          alert('here');
        }
      };
      xhttp.open("GET", address, true);
      xhttp.responseType = 'text';
      xhttp.send();
      */
    }, // end readPons

    receivedEvent: function(id) {
    } // receivedEvent
};
