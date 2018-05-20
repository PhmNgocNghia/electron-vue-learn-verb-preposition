const path = require('path')
const helper = require('./helper')
const url = require('url')
const fs = require('fs')
const scrapInput3 = require('./scrapeInput3')
const uniqid = require('uniqid');

//Open file
let phrasalVerbs = []
let VprepO = []

// Read line by line
const lineReader = require('readline').createInterface({
  input: fs.createReadStream(path.join(__dirname, 'VPrepO.txt'))
})

// Then
lineReader.on('line', function (line) {
  words = line.split(":").map(words => words.trim());
  const meaning = words[words.length - 1]

  /**
   * Word with the same meaning from 0 to N - 2
   */
  const content = words[0]

  /**
   * Xác định
   * verb
   * position
   */
  const verb = words[0]
  const preposition = words[1]


  VprepO.push({
    id: uniqid(),
    verb,
    preposition,
    describes: [
      {
        meaning:words[words.length-1]
      }
    ],
    isBookmarked: false,
    lastLearn: null
  })
})

global.test = []
var requests = [
  {
    url: `https://www.englishclub.com/vocabulary/phrasal-verbs-list.htm`,
    resolve: ($) => {
      helper.parseTable(phrasalVerbs, $)
    }
  },
  {
    url: `http://www.gingersoftware.com/content/grammar-rules/verbs/list-of-phrasal-verbs/`,
    resolve: ($) => {
      helper.parseTable(phrasalVerbs, $)
    }
  },
  {
    url: `http://grammar.ccc.commnet.edu/grammar/phrasals.htm`,
    resolve: ($) => {
      helper.parseTable(phrasalVerbs, $)
    }
  }
]

var promises = requests.map(
  request => {
    return new Promise((resolve) => {
      helper.createCheerioRequest(request.url)
        .then(request.resolve)
        .then(() => {
          resolve()
        })
    })
  }
);

promises.push(...[
  helper.readPhrasalVerb("input2.json", phrasalVerbs),
  helper.readPhrasalVerb("input3.json", phrasalVerbs)
])

Promise.all(promises).then(() => {
  //Save file here
  helper.saveContentToFile(path.resolve(__dirname, "output.json"), {
    phrasalVerbs,
    VprepO
  })
}).catch(err => {
  console.log(err)
})