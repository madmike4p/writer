const sqlite3 = require('sqlite3').verbose()

var koma2pl = function (pl_line) {
  // male litery
  var line = pl_line.replace(/z\'\'/g, 'ź');
  line = line.replace(/z\'/g, 'ż');
  line = line.replace(/a\'/g, 'ą');
  line = line.replace(/c\'/g, 'ć');
  line = line.replace(/e\'/g, 'ę');
  line = line.replace(/l\'/g, 'ł');
  line = line.replace(/n\'/g, 'ń');
  line = line.replace(/o\'/g, 'ó');
  line = line.replace(/s\'/g, 'ś');
  // duze litery
  line = line.replace(/Z\'\'/g, 'Ź');
  line = line.replace(/Z\'/g, 'Ż');
  line = line.replace(/A\'/g, 'Ą');
  line = line.replace(/C\'/g, 'Ć');
  line = line.replace(/E\'/g, 'Ę');
  line = line.replace(/L\'/g, 'Ł');
  line = line.replace(/N\'/g, 'Ń');
  line = line.replace(/O\'/g, 'Ó');
  line = line.replace(/S\'/g, 'Ś');
  return line;
};

let db = new sqlite3.Database('./db/enDict00.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('connected');
});

db.serialize(() => { 
  db.each('select id, pl_word from words', (err, row) => {
    if (err) {
      console.error(err.message);
    }
    
    var id = row.id;
    var pl_word = koma2pl(row.pl_word);
    // var notes = koma2pl(row.notes);
    console.log(pl_word);
    db.run('update words set pl_word = ? where id = ?',
      [pl_word, id],
      (err) => {
        if (err) {
          console.error(err.message);
        }
      }
    );

  });
});
