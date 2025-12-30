import { createApp } from 'vue'
import { createPinia } from 'pinia' // ថែម
import router from './router' // ថែម
import './style.css'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia()) // ប្រើ Pinia
app.use(router) // ប្រើ Router
app.mount('#app')