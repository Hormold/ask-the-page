import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./Popup.vue";

const app = createApp(App).use(createPinia());
app.mount('#app')

// Debugging
window.addEventListener('beforeunload', function (e) {
  debugger;
});