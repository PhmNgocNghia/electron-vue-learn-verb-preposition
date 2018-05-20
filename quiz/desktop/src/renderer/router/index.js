import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {path: '/', component: require('./DashBoard.vue').default},
    {path: '/settings', component: require('./Settings.vue').default},
    {path: '/quiz/:quizType', component: require('./Quiz.vue').default},
    {path: '*', redirect: '/'}
  ]
})
