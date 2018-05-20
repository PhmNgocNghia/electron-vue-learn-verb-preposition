<template>
  <v-container>
    <doughnut-chart
    :data = "chartData"
    :options = "chartOption"
    :width="100"
    :height="50">
    </doughnut-chart>
  </v-container>
</template>

<script>
/**
 * TODO :
 * Reactivity prop : mỗi lần học update lại data render lại
 */
import {
  learnWhat
} from '../constant'

import helper from '../helper'
import DoughnutChart from '../components/DoughnutChart'
/**
 * Gồm :
 * Chart thể hiện
 * Từ đã học
 * Từ Chưa học
 * Từ không biết
 * Từ đã lưu
 */

// Load dữ liệu từ cơ sở dữ liệu
const db = helper.getDbInstance()

export default {
  data () {
    return {
      chartOption: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 50,
            fontSize: 20
          }
        }
      },

      chartData: {
        datasets: [{
          data: [10, 30],
          backgroundColor: [
            '#2196F3',
            '#B3E5FC',
            '#78909C'
          ]
        }]
      }
    }
  },

  components: {
    DoughnutChart
  },

  computed: {
    settings () {
      return this.$store.state.settings
    }
  },

  created () {
    /**
     * reduce database lại thành các thành phần
     * [lastLearn = true && isWrong = false, && isWrong = true, lastLearn = false]
     */
    const tableName =
      this.settings.learnWhat === learnWhat.phrasalVerb ? 'phrasalVerbs' : 'VprepO'

    const data = db.get(tableName).reduce((arr, pharasalVerb) => {
      if (pharasalVerb.lastLearn) {
        arr[0]++
      } else {
        arr[1]++
      }
      return arr
    }, [0, 0]).value()

    this.chartData.datasets[0].data = data
    this.chartData.labels = [
      `ĐÃ HỌC [${data[0]}]`,
      `CHƯA HỌC [${data[1]}]`
    ]
  }
}
</script>

<style>


</style>
