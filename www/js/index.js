function errorDB(err) { alert("Error processing SQL: "+ err.code + " " + err.message); }
function successDB() {}
function errorFile(err) { alert("FileSystem Error: " + err); }

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
  sql += 'added text default "",';
  sql += 'modified text default ""';
  sql += ')';
  tx.executeSql(sql);
}  

function clearDB(tx){
  tx.executeSql("delete from words where 1");
}

function insertRecord(param, count, length) {
  return function (tx) {
    var sql = '';
    sql += 'insert into words ';
    sql += '(gb_word, us_word, ph_word, ir_word, pl_word, notes, added, modified) ';
    sql += 'values (?, ?, ?, ?, ?, ?, ?, ?)';
    tx.executeSql(sql, param);

    if (typeof count !== 'undefined') {
      if (count % 50 == 0) app.configMessage('insert ' + count + ' of ' + length);
      if (count == (length - 1)) app.configMessage('End, inserted ' + length + ' records.');
    }
  }
}

function searchWordLike(param) {
  var lineEn = '';
  var linePl = '';
  var container = document.getElementById('container');
  container.innerHTML = '';
  return function (tx) {
    tx.executeSql("select id, gb_word, ir_word, ph_word, pl_word, notes from words where gb_word like ?", [param], function(tx1, result) {	 
      var tab = [];
      for (var x = 0; x < result.rows.length; x++) {
        var line = '<a href="#" data-id="{id}" class="wordTag" style="color: white">{word}</a>';
        line = line.replace('{id}', result.rows.item(x).id);
        line = line.replace('{word}', result.rows.item(x).gb_word);
        tab.push(line);
      }
          
      if (tab.length > 0) {
        lineEn = '<div id="wordsEn">' + tab.join(" ") + '</div>';
        container.innerHTML += lineEn;
      }
    }, errorDB);  

    tx.executeSql("select id, gb_word, ir_word, ph_word, pl_word, notes from words where pl_word like ?", [param], function(tx1, result) {	 
      var tab = [];
      for (var x = 0; x < result.rows.length; x++) {
        var line = '<a href="#" data-id="{id}" class="wordTag" style="color: white">{word}</a>';
        line = line.replace('{id}', result.rows.item(x).id);
        line = line.replace('{word}', result.rows.item(x).pl_word);
        tab.push(line);
      }
          
      if (tab.length > 0) {
        linePl = '<div id="wordsPl">' + tab.join(" ") + '</div>';
        container.innerHTML += linePl;
      }
      app.bindWords();
    }, errorDB);  
  }
}

function exportDbToFile(tx) {
  tx.executeSql("select gb_word, us_word, ph_word, ir_word, pl_word, notes, added, modified from words", [], function(tx1, result) {	 
    if(enWordsFile) {
      var words = {};

      for (var x = 0; x < result.rows.length; x++)  {
        words[x] = {};
        words[x].gb = result.rows.item(x).gb_word;
        words[x].us = result.rows.item(x).us_word;
        words[x].ph = result.rows.item(x).ph_word;
        words[x].ir = result.rows.item(x).ir_word;
        words[x].pl = result.rows.item(x).pl_word;
        words[x].notes = result.rows.item(x).notes;
        words[x].added = result.rows.item(x).added;
        words[x].modified = result.rows.item(x).modified;
       }
      words.length = x;

      enWordsFile.createWriter(function(fileWriter) {
        fileWriter.write(JSON.stringify(words, null, 2));
        app.configMessage('Db dump saved, ' + x + ' records');
      }, errorFile);
    }
  }, errorDB); 
}

var db = window.openDatabase("words.db", "1.0", "enWords", 1000000);
var enWordsFile;

var app = {
    initialize: function() {
      this.bindEvents();
    }, // end initialize

    bindEvents: function() {
      document.addEventListener('deviceready', this.onDeviceReady, false);
            
      document.getElementById('updateDbFromTemplateBtn').addEventListener('click', this.updateDbFromTemplateBtn, false);
      document.getElementById('updateDbFromFileBtn').addEventListener('click', this.updateDbFromFileBtn, false);
      document.getElementById('exportDbToFileBtn').addEventListener('click', this.exportDbToFileBtn, false);

      $("#search").on("input", function(){
        
        var searchString = '%' + $(this).val() + '%';
        if ($(this).val().length > 2) db.transaction(searchWordLike(searchString), errorDB, successDB);
      });
      document.getElementById('search').focus();

      $('#search').keydown(this.keyboardAction);
      
      // podpiecie checkboxow z jquery.mobile poprzez addEventListener nie dziala, wiec:
      $("#updateDbFromTemplateBtnBox").click(function(event) {
          if ( $(this).prop("checked") == true ) {
            $('#updateDbFromTemplateBtn').removeAttr("disabled");
          } else {
            $('#updateDbFromTemplateBtn').attr("disabled", "");
          }
      });

      $("#updateDbFromFileBtnBox").click(function(event) {
          if ( $(this).prop("checked") == true ) {
            $('#updateDbFromFileBtn').removeAttr("disabled");
          } else {
            $('#updateDbFromFileBtn').attr("disabled", "");
          }
      });

      $("#exportDbToFileBtnBox").click(function(event) {
          if ( $(this).prop("checked") == true ) {
            $('#exportDbToFileBtn').removeAttr("disabled");
          } else {
            $('#exportDbToFileBtn').attr("disabled", "");
          }
      });


      document.getElementById('readPonsButton').addEventListener('click', this.readPons, false);

      document.getElementById('searchBtn').addEventListener('click', this.searchMode, false);
      document.getElementById('newBtn').addEventListener('click', this.newMode, false);
    }, // end bindEvents

    bindWords: function() {
      $(".wordTag").off();
      $(".wordTag").click(function() {
        app.getWord($(this).attr("data-id"));
      });
    },

    getWord: function(id) {
      alert('in getWord with ' + id);
      /*
      db.transaction(function(tx){
      tx.executeSql("select * from words where id = ?", [id], function(tx1, result) {	 
        app.createWord(
          result.rows.item(0).gb_word,
          result.rows.item(0).us_word,
          result.rows.item(0).ph_word,        
          result.rows.item(0).ir_word,
          result.rows.item(0).pl_word,
          result.rows.item(0).notes);
      }, errorDB);
    }, errorDB, successDB);
    */
    },
    
    createWord: function(gb_word, us_word, ph_word, ir_word, pl_word, notes) {
      /*
      document.getElementById('pl').style.display = 'none';
      document.getElementById('gb').style.display = 'none';
      document.getElementById('us').style.display = 'none';      
      document.getElementById('ph').style.display = 'none';
      document.getElementById('ir').style.display = 'none';
      document.getElementById('note').style.display = 'none';
      
      document.getElementById('pl').style.display = 'block';
      document.getElementById('pl').firstElementChild.innerHTML = removeHTML(pl_word);
      
      document.getElementById('gb').style.display = 'block';
      document.getElementById('gb').firstElementChild.innerHTML = removeHTML(gb_word);
      
      if (us_word) {
        document.getElementById('us').parentNode.display = 'block';
        document.getElementById('us').firstElementChild.innerHTML = removeHTML(us_word);
      }
      
      if (ph_word) {
        document.getElementById('ph').style.display = 'block';
        document.getElementById('ph').firstElementChild.innerHTML = bracket2html(ph_word);
      }
      
       if (ir_word) {
        document.getElementById('ir').style.display = 'block';
        document.getElementById('ir').firstElementChild.innerHTML = removeHTML(ir_word);
      }
      
      if (notes) {
        document.getElementById('note').style.display = 'block';
        document.getElementById('note').firstElementChild.innerHTML = removeHTML(notes);
      }
      */
    },

    keyboardAction: function(event) {

      var activePage = $.mobile.pageContainer.pagecontainer('getActivePage').attr('id');
      if (activePage == 'main') {
        if (event.keyCode == 13) app.readPons();
      }
      return true;
    },
    
    onDeviceReady: function() {
      app.receivedEvent('deviceready');
      db.transaction(createDB, errorDB, successDB);
    }, // onDeviceReady

    updateDbFromTemplateBtn: function() {
      app.disableAll();
      db.transaction(clearDB, errorDB, successDB);
      for (var x = 0; x < wordsDb.length; x++) {
        var record = [
          wordsDb[x].gb,
          wordsDb[x].us,
          wordsDb[x].ph,
          wordsDb[x].ir,
          wordsDb[x].pl,
          wordsDb[x].notes,
          wordsDb[x].added,
          wordsDb[x].modified
        ];
      db.transaction(insertRecord(record, x, wordsDb.length), errorDB, successDB);
      }

    },

    updateDbFromFileBtn: function() {
      app.disableAll();
      db.transaction(clearDB, errorDB, successDB);

      window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function(dir) {
            dir.getFile("enWords.txt", {create:true}, function(file) {
              enWordsFile = file;
              app.readFromFileToDb();
            });
          }); 
    },

    readFromFileToDb: function() {
      enWordsFile.file(function(file) {
        var reader = new FileReader();
        reader.onloadend = function(e) {
          var extWordsDb = JSON.parse(this.result);
          for (var x = 0; x < extWordsDb.length; x++) {
            var record = [
              extWordsDb[x].gb,
              extWordsDb[x].us,
              extWordsDb[x].ph,
              extWordsDb[x].ir,
              extWordsDb[x].pl,
              extWordsDb[x].notes,
              extWordsDb[x].added,
              extWordsDb[x].modified
            ];

          db.transaction(insertRecord(record, x, extWordsDb.length), errorDB, successDB);
          }

        };
        reader.readAsText(file);
      }, errorFile);
    },

    exportDbToFileBtn: function() {
      app.disableAll();
      
      window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function(dir) {
            dir.getFile("enWords.txt", {create:true}, function(file) {
              enWordsFile = file;
              db.transaction(exportDbToFile, errorDB, successDB);
            });
          }); 

    },

    disableAll: function() {
      $('#updateDbFromTemplateBtn').attr("disabled", '');
      $('#updateDbFromFileBtn').attr("disabled", '');
      $('#exportDbToFileBtn').attr('disabled', '');
      
      $('#updateDbFromTemplateBtnBox').prop('checked', false).checkboxradio('refresh');
      $('#updateDbFromFileBtnBox').prop('checked', false).checkboxradio('refresh');
      $('#exportDbToFileBtnBox').prop('checked', false).checkboxradio('refresh');
    },

    configMessage: function(msg) {
      document.getElementById('configDivMsg').innerHTML = msg;
    },

    readPons: function(event) {
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
