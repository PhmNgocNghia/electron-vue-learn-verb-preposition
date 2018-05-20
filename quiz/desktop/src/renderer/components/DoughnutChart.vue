

<script>
/**
 * Gồm :
 * Chart thể hiện
 * Từ đã học
 * Từ Chưa học
 * Từ không biết
 * Từ đã lưu
 */
import { Doughnut } from 'vue-chartjs'

export default {
  extends: Doughnut,
  props: ['data', 'options'],
  mounted () {
    this.renderChart(this.data, this.options)
  }
}
</script>

<style>

</style>
