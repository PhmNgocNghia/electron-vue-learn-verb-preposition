// Preposition list
const prepositionList = [
  "with",
  "at",
  "from",
  "into",
  "during",
  "including",
  "until",
  "against",
  "among",
  "throughout",
  "despite",
  "towards",
  "upon",
  "concerning",
  "of",
  "to",
  "in",
  "for",
  "on",
  "by",
  "about",
  "like",
  "through",
  "over",
  "before",
  "between",
  "after",
  "since",
  "without",
  "under",
  "within",
  "along",
  "following",
  "across",
  "behind",
  "beyond",
  "plus",
  "except",
  "but",
  "up",
  "out",
  "around",
  "down",
  "off",
  "above",
  "near",
  "arround",
]

const fs = require('fs')
var rp = require('request-promise')
var path = require('path')
const cheerio = require('cheerio')

module.exports = {
  findSamePharasalVerb(list, verb, preposition) {
    const regex = new RegExp("\\b" + verb + " " + preposition + "\\b","i")
    return list.find(item =>
      regex.test(item.verbs)
    )
  },

  isPreposition(word) {
    return prepositionList.indexOf(word) !== -1;
  },

  addPhraselVerb(list, verb, preposition, phrasalVerb, describes) {
    let sameWord = ''
    if(preposition) // Some word should not find prep like go through and go though with
      sameWord = this.findSamePharasalVerb(list, verb, preposition)
    else sameWord = null

    if(sameWord) {

      // Merge example
      sameWord.describes.push(...describes)
      foundSameWord = true;
    } else { // If doesn't found same word
        list.push({
        verbs: [phrasalVerb],
        describes: [...describes],
        isBookmarked: false,
        isLearned: false,
      })
    }
  },

  saveContentToFile(path, content) {
      //Write file to json
      fs.writeFile(
        path,
        JSON.stringify(content),
        function (err) {
          if (err) {
            return console.log(err);
          }
        }
      )
  },

  createCheerioRequest(uri) {
    return rp({
      uri,
      transform: function (body) {
        return cheerio.load(body);
      }
    })
  },

  parseTable(list, $) {
    $("table>tbody>tr").each((index, tr) => {
      const td = $(tr.children).filter("td");

      /**
       * 0 = verb, ex : break in
       * 1 = meaning
       * 2 = example
       */
      if(td.length !== 3) {
        return;
      }

      const fullVerb = td.eq(0).text();
      const words = fullVerb.split(" ");
      const pureVerb = words[0] // verb without preposition
      const meaning = td.eq(1).html()
      const example = td.eq(2).html();
      //Search for the first preposition appear
      for (var i = 1; i < words.length; i++) {
        if (this.isPreposition(words[i])) {
          this.addPhraselVerb(list, pureVerb, words[i], fullVerb, [{
            meaning,
            example
          }]);
          break;
        }
      }
    })
  },

  extractPharasalVerbIntoVerbAndPrep(phrasalVerb) {
    const words = phrasalVerb.split(' ')
    const verb = words[0] // verb without preposition
    const preposition = words[1]

    // By the convention, 0 = verb, 1 = preposition
    return {
      verb,
      preposition
    }
  },


  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  readPharasalVerb(fileName, list) {
    var self = this
    return fs.readFile(path.resolve(__dirname, fileName), 'utf8', function (err, data) {
      var importPharasalVerbs =  JSON.parse(data);
      importPharasalVerbs.forEach(phrasalVerb => {
        self.addPhraselVerb(
          list,
          phrasalVerb.verb,
          phrasalVerb.preposition,
          phrasalVerb.phrasalVerb,
          phrasalVerb.describes
        )
      })
    })
  }
}