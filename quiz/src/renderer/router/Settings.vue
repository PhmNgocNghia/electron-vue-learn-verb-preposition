<template>
  <!--Todo
    Textbox: numWordLearnEachTime
    Dropdown: learnType
  -->
  <v-container

  v-if = "settings">
    <v-form>
      <v-slider
        label = "Số từ mỗi lần học"
        :min = "10"
        :max = "100"
        :step = "10"
        :persistent-hint = "true"
        :hint = "'Số từ : ' + settings.numWordLearnEachTime"
        v-model = "settings.numWordLearnEachTime">
      </v-slider>
      <v-radio-group
        label = "Chọn loại từ muốn học"
        v-model = "settings.learnWhat">
          <v-radio
            :key = "value"
            v-for = "value in ['phrasal verb', 'verb + prep + object']"
            :label = "value"
            :value="value">
          </v-radio>
      </v-radio-group>
      <v-btn @click="saveContent" color="primary">Lưu</v-btn>
    </v-form>

    <v-snackbar
      :bottom="true"
      v-model="snackBar.show"
      :multi-line="true"
    >
      {{ snackBar.text }}
      <v-btn flat color="blue" @click.native="snackBar.show = false">Close</v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
import {
  learnWhat
} from '../constant'
const fs = require('fs')
const path = require('path')

export default {
  created () {
    this.settings = Object.assign({}, this.$store.state.settings)
  },

  data () {
    return {
      learnWhats: [learnWhat.both, learnWhat.verbPrepObject],
      snackBar: {
        show: false,
        text: ''
      },
      settings: null
    }
  },

  methods: {
    saveContent () {
      fs.writeFile(
        path.resolve(__static, 'settings.json'),
        JSON.stringify(this.settings),
        (err) => {
          this.snackBar.show = true

          if (err) {
            this.snackBar.text = err
          } else {
            this.snackBar.text = 'Lưu cài đặt thành công'
          }
        })

      this.$store.dispatch('setSettings', this.settings)
    }
  }
}
</script>

<style>

</style>
