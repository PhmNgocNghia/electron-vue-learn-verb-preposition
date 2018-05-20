const cheerio = require('cheerio')
const helper = require('./helper')
const path = require('path')
const url = require('url')

helper.createCheerioRequest('https://www.learn-english-today.com/phrasal-verbs/phrasal-verb-list.html')
.then(($) => {
  var links = $("#t1-resp0 a")
  var promises = links.map((index, a) => {
    var link = url
        .resolve(
          'https://www.learn-english-today.com/phrasal-verbs/phrasal-verb-list.html',
          a.attribs.href
        )

    return new Promise((resolve) => {
      helper.createCheerioRequest(link).then(($) => {
        /**
         * Content = #ph-verb-list>ul>li
         * Verb = span
         * Nested content = content > ul > li
         * Meaning = first line
         * Example = second line
         */
        var phrasalVerbs = []
        $("#ph-verb-list>ul>li").each((index, li) => {
          /**
           * Pharasal verb is the first tag of the content inside li
           */
          var phrasalVerb = $(li.children[0]).text().trim()
          var phrasalVerbPart = phrasalVerb.split(' ')
          li = $(li)

          //Should find preposition or not else just let it undefined
          var verb = null, preposition = null;
          if(phrasalVerbPart.length == 2 &&
            // which is preposition should contain a-zA-Z only
          /^[a-zA-Z]+$/.test( phrasalVerbPart[1])) {
            verb = phrasalVerbPart[0]
            preposition = phrasalVerbPart[1]
          }
          /**
           * Word may have more than one meaning
           * and example
           */
          var describes = []

          $(li.find("ul>li")).each((index, li) => {
            var nestedContent = $(li).text().trim().split("\n")
            describes.push({
              meaning: nestedContent[0].trim(),
              example: nestedContent[1].trim(),
            })
          })

          phrasalVerbs.push({
            phrasalVerb,
            verb,
            preposition,
            describes
          })


        })
        resolve(phrasalVerbs)
      })
    })
  }).toArray()

  // Parse finish, took a while cause more than 2000 words
  Promise.all(promises).then((phrasalVerbsArr) => {
    var phrasalVerbs = phrasalVerbsArr.reduce((arr, phrasalVerbs) => {
      return arr.concat(phrasalVerbs)
    }, [])

    helper.saveContentToFile(path.resolve(__dirname,"input3.json"), phrasalVerbs)
  }).catch((err) => {
    console.log(err)
  })
})
