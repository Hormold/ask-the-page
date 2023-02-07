<template>
  <div class="popupview">
    <ChromeExImg v-if="tab.favIconUrl === undefined" :filename="'icon-128.png'" />
    <img v-else :src="tab.favIconUrl" />
    <p>Ask The Page {{(isIndexed?'✅':'🔄')}}</p> 
    <small>{{ prettifyUrl(url) }} </small>

    Input your question here:
    <input type="text" v-model="question" />
    {{ question }}
  </div>
</template>

<script setup lang="ts">
import ChromeExImg from "../components/ChromeExImg.vue";
import { onMounted } from "vue";
import { storeToRefs } from 'pinia';
import { useAppStore } from "../store/app";
let question = "";
const appStore = useAppStore();
const { url, isIndexed, tab } = storeToRefs(appStore);

const prettifyUrl = (url: string) => {
  const urlObj = new URL(url);
  return urlObj.hostname;
};

onMounted(() => { 
    appStore.init();    
});
</script>

<style scoped>
.popupview {
  padding: 5px;
  background-color: white;
  font-size: 16px;
  color: black;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
}

small {
    font-size: 10px;
    color: #666;
}
</style>