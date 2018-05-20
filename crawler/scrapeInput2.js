const cheerio = require('cheerio')
const helper = require('./helper')
const path = require('path')
const url = require('url')

helper.createCheerioRequest('https://www.usingenglish.com/reference/phrasal-verbs/list.html')
.then(($) => {
  const linkHasBeenResolved = []
  const links = $("div.wraplist>ul>li>a");
  global.promises = links.map((index, a) => {
    return new Promise((resolve) => {
        var link = url
        .resolve(
          'https://www.usingenglish.com/reference/phrasal-verbs/list.html',
          a.attribs.href
        )

        /**
        * Remove the hashtag get the link
        * Check for dupplicate before push, because same word is same lin like get on, get down ... from get.html
        */
        var linkWithoutHasTag = link.split("#")[0]
        if(linkHasBeenResolved.includes(linkWithoutHasTag))
          resolve([]);
        else linkHasBeenResolved.push(linkWithoutHasTag)

        new Promise(resolve => setTimeout(resolve, 200 * index)).then(() => {
        helper.createCheerioRequest(link).then(($) => {
        /**
         * h2.card-title = verb
         * div.card-body > p.lead
         *  strong
         *    0 = meaning
         *    1 = example
         */

        /**
          * There may more than 2 pharasal verbs
          * Each verb take 2 contents
          * should exclude word meaning and example
          * first: meaning
          * second: example
          *
          * word 0, content : 0,1
          * word 2, content : 2,3
          * word n, content : n, n + 1
          */
          let extractedPhrasalVerbs = $("h2.card-title")
          const contents = $("div.card-body>p.lead")

          // Format data
          extractedPhrasalVerbs = extractedPhrasalVerbs.map((index, phrasalVerb) => {
            phrasalVerb = $(phrasalVerb).text()
            var extractedVerbAndPrep = helper.extractphrasalVerbIntoVerbAndPrep(phrasalVerb)
            /**
             * Extract word and meaning
             */
            let meaning  = $(contents[index]).text()
            let example = $(contents[index + 1]).text()

            // Không phải meaning tiến hành swap meaning và example
            if(meaning.includes("Example")) {
              let temp = meaning
              meaning = example
              example = temp
            }

            /**
             * Remove meaning and example in text
             */
            meaning = meaning.replace("Meaning: ","")
            example = example.replace("Example: ", "")

            return {
              phrasalVerb,
              verb: extractedVerbAndPrep.verb,
              preposition: extractedVerbAndPrep.preposition,
              describes: [{
                meaning: meaning,
                example: example
              }]
            }
          })

          // This is done resolve
          resolve(extractedPhrasalVerbs.toArray())
        })
        .catch(err => {
          console.log(link)
        })
      })
    }).catch(err => console.log(err))
  }).toArray()

  // Parse finish, took a while cause more than 2000 words
  Promise.all(global.promises).then((phrasalVerbsArr) => {
    var phrasalVerbs = phrasalVerbsArr.reduce((arr, phrasalVerbs) => {
      return arr.concat(phrasalVerbs)
    }, [])

    helper.saveContentToFile(path.resolve(__dirname,"input2.json"), phrasalVerbs)
  }).catch((err) => {
    console.log(err)
  })
})

