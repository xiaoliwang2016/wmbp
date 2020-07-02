import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import http from './utils/http'
import ElementUI from 'element-ui'

Vue.use(ElementUI)

import 'element-ui/lib/theme-chalk/index.css'
import '@/assets/css/base.css'

Vue.config.productionTip = false
Vue.prototype.http = http;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
