import {
  learnWhat
} from './constant'
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const path = require('path')
const adapter = new FileSync(path.resolve(__dirname, './assets/db.json'))
const db = low(adapter)
const fs = require('fs')
const shuffle = require('shuffle-array')

export default {
  getDbInstance () {
    return db
  },

  saveWord (word) {
    db
      .get('phrasalVerbs')
      .find({ id: word.id })
      .assign(word)
      .write()
  },

  createQuizzesData (phrasalVerbs, learnWhatParam) {
    var quizData = null
    if (learnWhatParam === learnWhat.phrasalVerb) {
      quizData = phrasalVerbs.map((phrasalVerb, index) => {
        var quiz = {}
        quiz.phrasalVerb = phrasalVerb
        /**
         * Tạo câu trả lời
         */
        quiz.answers = []
        quiz.correctAnswer = shuffle.pick(phrasalVerb.describes).meaning
        // Chọn ngẫu nhiên meaning của từ hiện tại
        quiz.answers.push(quiz.correctAnswer)

        /**
         * Chọn 3 từ ngẫu nhiên trong arr bằng cách
         * clone phrasalVerbs, bỏ phần tử hiện tại ra và pop 3 lần
         */
        var clonePhrasalVerbs = db
          .get('phrasalVerbs')
          .sampleSize(3)
          .value()

        for (let i = 0; i < 3; i++) {
          var popedPhrasalVerb = clonePhrasalVerbs.pop()
          var randomMeaning = shuffle.pick(popedPhrasalVerb.describes).meaning
          quiz.answers.push(randomMeaning)
        }

        /**
         * Đảo lộn tất cả phần từ trong mảng answers
         */
        shuffle(quiz.answers)

        /**
         * Lấy vị trí đúng
         */
        quiz.correctAnswerIndex = quiz.answers.indexOf(quiz.correctAnswer)

        /**
         * Todo :
         * Extract thành map bên dưới do
         * còn 1 learnWhat là có câu tìm giới từ
         */
        quiz.isError = false
        quiz.isSuccess = false
        quiz.isFinished = false

        return quiz
      })
    } else {

    }

    /**
     * Dữ liệu bắt buộc
     */

    return quizData
  },

  readSettings () {
    const data = fs.readFileSync(path.resolve(__dirname, './assets/settings.json'))
    const settings = JSON.parse(data)
    return settings
  }
}
