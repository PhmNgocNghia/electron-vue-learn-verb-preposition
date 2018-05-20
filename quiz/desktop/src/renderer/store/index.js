import Vue from 'vue'
import Vuex from 'vuex'
import modules from './modules'
import actions from './actions'
import mutations from './mutations'
import state from './state'

Vue.use(Vuex)

export default new Vuex.Store({
  modules,
  state,
  actions,
  mutations,
  strict: process.env.NODE_ENV !== 'production'
})
