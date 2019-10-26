const fs = require('fs');

var fileName = 'enWords.txt';
var words = {};

var content = fs.readFileSync(fileName, 'utf-8');
var wordsTab = content.trim().split('\n');

words.length = wordsTab.length;

for (var x = 0; x < words.length; x++) {
  words[x] = {};

  var line = wordsTab[x].trim()
  line = line.replace(/\"/g,"'");
  line = line.replace(/\</g,"[");
  line = line.replace(/\>/g,"]");

  var tab = line.split('|');

  words[x].en = tab[0];
  words[x].us = tab[1];
  words[x].ph = tab[2];
  words[x].ir = tab[3];
  words[x].pl = tab[4];
  words[x].nt = tab[5];
  words[x].dt = tab[7];
}

console.log(JSON.stringify(words, null, 2));

fs.writeFileSync("words.js", "var phrases = " + JSON.stringify(words) + ";");
fs.writeFileSync("words_pretty.js", JSON.stringify(words, null, 2));

