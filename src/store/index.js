import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		isInspection: false,
		mode: 'add',
		showCharts: true
	},
	mutations: {
		SetInspection(state, data) {
			state.isInspection = data
		},
		SetMode(state, data){
			state.mode = data
		},
		SetCharts(state, data){
			state.showCharts = data
		}
	},
	actions: {
	},
	modules: {
	}
})
