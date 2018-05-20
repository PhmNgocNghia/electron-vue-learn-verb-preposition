<template>
  <v-container>
    <div v-if = "quizzes && quizzes.length === 0" class="headline">
      <b>Chưa có từ nào trong danh sách {{quizTypeToString}}</b>
    </div>
    <div v-else-if="quizzes">
        <v-pagination
      circle
      :length="quizzes.length"
      v-model="page"></v-pagination>
      <div
        class="mt-4"
        :key = "index"
        v-if = "index == page - 1"
        v-for = "(quiz, index) in quizzes">
        <!-- <v-btn color="yellow" :round = "true">Lưu lại từ này</v-btn> -->
        <div class= "title mt-3">
          Câu {{index + 1}} / {{numWordLearnEachTime}} : <b> {{quiz.phrasalVerb.verb}} </b>
        </div>
        <v-radio-group
        v-model = "answers[index]">
          <div
            :key = "answer"
            v-for = "(answer, index) in quiz.answers"
            :class="[quiz.isError && index === quiz.correctAnswerIndex ? 'green white--radio':'', 'px-2 py-2']">
            <v-radio
              :color = "quiz.isError? 'red' : quiz.isSuccess ? 'green' : 'blue'"
              :disabled="quiz.isFinished && index !== answers[index]"
              :value = "index"
              :label="answer">
            </v-radio>
          </div>
        </v-radio-group>
        <v-layout class="mb-3">
           <!-- Floating button on top -->
          <v-btn
          round
          v-if = "!quiz.phrasalVerb.isBookmarked"
          @click = "bookMark(quiz.phrasalVerb)">
            <v-icon>bookmark</v-icon>
            Lưu lại từ này
          </v-btn>

          <v-btn
          round
          v-else
          @click = "unBookMark(quiz.phrasalVerb)">
            <v-icon>bookmark</v-icon>
            Bỏ lưu từ này
          </v-btn>

          <v-btn
          round
          @click = "speak(quiz.phrasalVerb)">
            <v-icon>volume_up</v-icon>
            Phát âm
          </v-btn>
          <!-- Floating button on top -->
          <v-btn
          round
          color ="primary"
          @click = "checkAnswer(index)"
          :disabled="quiz.isFinished">
            <v-icon>spellcheck</v-icon>
            Kiểm tra câu trả lời
          </v-btn>
          <v-btn
          round
          color = "secondary"
          :to = "$route.path + '?_=' + (new Date).getTime()"
          v-if = "index + 1 === quizzes.length">
            <v-icon>queue_play_next</v-icon>&nbsp;
            Học tiếp {{numWordLearnEachTime}} từ
          </v-btn>
        </v-layout>
        <div class="subheading" v-if = 'quiz.isFinished'>
          <span>Thông tin thêm :</span>
          <div>
            <div
            class="ml-3 mt-3"
            :key = index
            v-for = "(describe, index) in quiz.phrasalVerb.describes">
              <div><b>Nghĩa là:</b> {{describe.meaning}}</div>
              <div class="ml-4" v-if = "describe.example">
                <b>Ví dụ:</b> {{describe.example}}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script>
/**
TODO :
Làm xong check xem còn câu nào chưa làm không
Không thì hiển thị nút di chuyển ra dashboard

Tạo component quiz và truyền các giá trị này vào
Component quiz sẽ có event onBookMarked
OnBookMarked
 */
import helper from '../helper'
import {
  quizType,
  learnWhat
} from '../constant'
import say from 'say'
const db = helper.getDbInstance()

export default {
  computed: {
    numWordLearnEachTime () {
      return this.$store.state.settings.numWordLearnEachTime
    },

    quizTypeToString () {
      switch (this.$route.params.quizType) {
        case quizType.reviewLearned:
          return 'đã học'
        case quizType.reviewBookmarked:
          return 'đã lưu'
        case quizType.learnNew:
          return 'chưa học'
      }
    }
  },

  methods: {
    speak (pharasalVerb) {
      say.stop()
      say.speak(pharasalVerb.verb)
    },

    reload () {
      this.$router.go({
        path: this.$router.path
      })
    },

    bookMark (word) {
      word.isBookmarked = true
      helper.saveWord(word)
    },

    unBookMark (word) {
      word.isBookmarked = false
      helper.saveWord(word)
    },

    checkAnswer (index) {
      /**
       * Answers[index] === quiz[index].correctAnswerIndex
       * True
       * False -> Hiển thị alert, đổi màu radio hiện tại = đỏ, đúng xanh dương
       * Hiện describes len
       */
      const currentQuiz = this.quizzes[index]
      if (this.answers[index] === currentQuiz.correctAnswerIndex) {
        /**
         * Correct answer
         */
        currentQuiz.isSuccess = true
      } else {
        /**
         * Wrong answer
         * Cái đúng có background màu xanh là cây
         * isError = true và index == correctAnswerIndex
         */
        currentQuiz.isError = true
        // currentQuiz.isFinished = true
      }

      currentQuiz.isFinished = true

      /**
       * set là đã học và đưa lên lại cơ sở dữ liệu
       */

      const currentPhrasalVerb = currentQuiz.phrasalVerb
      currentPhrasalVerb.lastLearn = new Date()
      helper.saveWord(currentPhrasalVerb)
    },

    createQuizzes () {
      // Reset page tại vị trí 1
      this.page = 1
      this.answers = new Array(this.numWordLearnEachTime).fill(0)

      // Generate filterCondition
      let learnWhatCondition = null
      const tableName =
        this.$store.state.settings.learnWhat ===
          learnWhat.phrasalVerb ? 'phrasalVerbs' : 'VprepO'

      let pharasalVerbs = null

      switch (this.$route.params.quizType) {
        case quizType.reviewLearned: // build this
          pharasalVerbs = db
            .get(tableName)
            .filter((pharasalVerb) => pharasalVerb.lastLearn !== null)
            .sortBy((pharasalVerb) => new Date(pharasalVerb.lastLearn))
            .take(this.numWordLearnEachTime)
            .value()
          break

        case quizType.reviewBookmarked:
          pharasalVerbs = db
            .get(tableName)
            .filter(Object.assign({}, {
              isBookmarked: true
            }, learnWhatCondition))
            .sortBy((pharasalVerb) => new Date(pharasalVerb.lastLearn))
            .take(this.numWordLearnEachTime)
            .value()
          break

        case quizType.learnNew:
          pharasalVerbs = db
            .get(tableName)
            .filter(Object.assign({}, {
              lastLearn: null
            }, learnWhatCondition))
            .take(this.numWordLearnEachTime)
            .value()
          break
      }

      // Tạo quiz = lập trình hàm này + lập trình component quiz
      this.quizzes = helper.createQuizzesData(
        pharasalVerbs,
        this.$store.state.settings.learnWhat)
    }
  },

  data () {
    return {
      page: 0,
      quizzes: null,
      answers: []
    }
  },

  mounted () {
    // Load settings
    this.createQuizzes()
  },

  watch: {
    '$route' (to, from) {
      // react to route changes...
      this.createQuizzes()
    }
  }
}
</script>

<style>
li {
  list-style-position: inside;
}

.white--radio label,
.white--radio i{
  color: white !important
}
</style>
