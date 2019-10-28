function errorDB(err) { alert("Error processing SQL: "+ err.code + " " + err.message); }
function successDB() {}

function createDB(tx){
  var sql = '';
  sql += 'create table if not exists words(';
  sql += 'id integer primary key,';
  sql += 'gb_word text not null,';
  sql += 'us_word text default "",';
  sql += 'ph_word text default "",';
  sql += 'ir_word text default "",';
  sql += 'pl_word text not null,';
  sql += 'notes text default "",';
  sql += 'added text default ""';
  sql += ')';
  tx.executeSql(sql);
}  

function clearDB(tx){
  tx.executeSql("delete from words where 1");
}

var db = window.openDatabase("words.db", "1.0", "enWords", 1000000);

var app = {
    initialize: function() {
      this.bindEvents();
    }, // end initialize

    bindEvents: function() {
      document.addEventListener('deviceready', this.onDeviceReady, false);
      
      document.getElementById('ClearDbBtnBox').addEventListener('click', this.clearDbBtnBox, false);
      document.getElementById('updateDbFromTemplateBtnBox').addEventListener('click', this.updateDbFromTemplateBtnBox, false);
      document.getElementById('updateDbFromFileBtnBox').addEventListener('click', this.updateDbFromFileBtnBox, false);
      document.getElementById('exportDbToFileBtnBox').addEventListener('click', this.exportDbToFileBtnBox, false);
      

      document.getElementById('readPonsButton').addEventListener('click', this.readPons, false);

      document.getElementById('searchBtn').addEventListener('click', this.searchMode, false);
      document.getElementById('newBtn').addEventListener('click', this.newMode, false);
    }, // end bindEvents
    
    onDeviceReady: function() {
      app.receivedEvent('deviceready');
      db.transaction(createDB, errorDB, successDB);
    }, // onDeviceReady

    clearDbBtnBox: function(event) {
      
    },
    
    updateDbFromTemplateBtnBox: function(event) {
    },
    
    updateDbFromFileBtnBox: function(event) {
    },
    
    exportDbToFileBtnBox: function(event) {
    },
    
    readPons: function(event) {
      console.log('inReadPons');
      var address = 'https://pl.pons.com/t%C5%82umaczenie?q={0}&l=enpl&in=&lf=en&qnac=';
      
      var text = document.getElementById('search').value;

      
      address = address.replace('{0}', encodeURI(text));


      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          app.ponsParse(this.response);
          
          
          
        
        }
      };
      xhttp.open("GET", address, true);
      xhttp.responseType = 'text';
      xhttp.send();

    }, // end readPons

     ponsParse: function(response) {
        var container = document.getElementById('container');
        container.innerHTML = '';
          
        var header = document.createElement('div');
        header.className = 'results';
        header.innerHTML = 'PONS Loaded...';
        container.appendChild(header);
        
        // interesuje mnie tylko to co jest w body
        var site = response.split('\n');
        var start = -1;
        var stop = -1;
          
        for (var x = 0; x < site.length; x++) {
          if (site[x].indexOf('<body') > -1) start = x;
          if (site[x].indexOf('</body>') > -1) stop = x;
        }
          
        site = site.splice(start + 1, stop - start - 1);
        
        // element do parsowania
        var tmpNode = document.createElement('div');
        tmpNode.style.display = 'none';
        tmpNode.innerHTML = site.join('\n');
        document.body.appendChild(tmpNode);
          
        // usuwamy wszystkie ul, tylko przeszkadzaja  
        var del = document.querySelectorAll('.results ul');
        for (var x = 0; x < del.length; x++) {
          del[x].parentNode.removeChild(del[x]);
        }
         
        var del = document.querySelectorAll('.results .link-examples-toolbar');
        for (var x = 0; x < del.length; x++) {
          del[x].parentNode.removeChild(del[x]);
        }

        var del = document.querySelectorAll('.results a');
        for (var x = 0; x < del.length; x++) {
          var text = document.createTextNode(del[x].text);
          del[x].parentNode.replaceChild(text, del[x]);
        }

        var del = document.querySelectorAll('.phonetics .region');
        for (var x = 0; x < del.length; x++) {
          del[x].nextSibling.parentNode.removeChild(del[x].nextSibling);
          var previousSibling = del[x].previousSibling;
          var text = previousSibling.textContent;
          text = text.replace(/([/s/S]*),/, '$1').trim() + ']';
          var newPreviousSibling = document.createTextNode(text);
          del[x].parentNode.replaceChild(newPreviousSibling, previousSibling);
          del[x].parentNode.removeChild(del[x]);
        }
         
        var test = document.querySelectorAll('.results');
        for (var x = 0; x < test.length; x++) {
          document.getElementById('container').appendChild(test[x]);
        }

        var phonetics = document.querySelectorAll('.results .phonetics');
        for (var x = 0; x < phonetics.length; x++) {
          phonetics[x].addEventListener('click', app.onPhoneticsClick, false);
        }
          
        var flexion = document.querySelectorAll('.results .flexion');
        for (var x = 0; x < flexion.length; x++) {
          flexion[x].addEventListener('click', app.onFlexionClick, false);
        }
          
        // tu usuniecie starych
        document.body.removeChild(tmpNode);
     },
     
     onPhoneticsClick: function(event) {
      document.getElementById('ph').innerHTML = this.innerHTML.replace('[', '').replace(']', '').replace(/<span class=\"super\">ə<\/span>/g, '(ə)');
     },
     
     onFlexionClick: function(event) {
        document.getElementById('ir').innerHTML = this.innerHTML;
     },

     searchMode: function(event) {
      app.setMode(0);
     },

     newMode: function(event) {
       app.setMode(1);
     },
    
    setMode: function(mode) {
      var input = document.querySelectorAll('.word input');
      var p = document.querySelector('.word p');

      switch (mode) {
        case 0:
          for (var x = 0; x < input.length; x++) {
            input[x].style.display = 'none';
          }
          for (var x = 0; x < p.lenght; x++) {
            p[x].style.display = 'block';
          }
          break;
        case 1:
          for (var x = 0; x < input.length; x++) {
            input[x].style.display = 'block';
          }
          for (var x = 0; x < p.lenght; x++) {
            p[x].style.display = 'none';
          }
          break;
        case 2:
          break;
      }
    },

    receivedEvent: function(id) {
    }, // receivedEvent
    
    _mode: 0
};
