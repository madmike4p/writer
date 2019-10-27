const sqlite3 = require('sqlite3').verbose();

let dbFrom = new sqlite3.Database('db/enDict12.db');
let db = new sqlite3.Database('enDict.db');

var html2bracket = function (line) {
  return line.replace(/<span class=\"super\">ə<\/span>/g, '(ə)');
};

var bracket2html = function (line) {
  return line.replace(/\(ə\)/g, '<span class=\"super\">ə<\/span>');
};

var createSQL = 'create table if not exists words( id integer primary key, gb_word text not null, us_word text default "", ph_word text default "", ir_word text default "", pl_word text not null, rate integer default 0, notes text default "", added text default "", unique(gb_word, pl_word) on conflict ignore)';


var selectSQL = 'select gb_word, us_word, pl_word, notes, pronunciation, ir_word from words';
var insertSQL = 'insert into words (gb_word, us_word, ph_word, ir_word, pl_word, notes, rate, added) values (?, ?, ?, ?, ?, ?, "0", "2019-01-01")';

db.run(createSQL);

dbFrom.each(selectSQL, (err, row) => {
	if (err) { console.log(err.message); }
	
	db.run(insertSQL,
	[row.gb_word,
	row.us_word,
	html2bracket(row.pronunciation),
	row.ir_word,
	row.pl_word,
	row.notes],
	(err) => { 
		if (err) { console.log("insert: " + err.message); }

	});
	
});
