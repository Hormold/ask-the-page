<template>
  <div class="popupview">
    <ChromeExImg v-if="tab.favIconUrl === undefined" :filename="'icon-128.png'" />
    <img v-else :src="tab.favIconUrl" />
    <div v-if="error">{{ error }}</div>
    <p>Ask The Page {{(isIndexed?'✅':'🔄')}}</p> 
    <small>{{ prettifyUrl(url) }} {{ pageId?`(${pageId})`:'' }}</small>

    <div v-if="!hasApiKey">
        <p>Enter your API key:</p>
        <input type="text" v-model="apiKey" />
        <button @click="appStore.updateApiKey(apiKey)">Save</button>
    </div>
    <div v-else>
        Input your question here:
        <input type="text" v-model="question" />
        <button @click="appStore.askQuestion(question)" :disabled="isLoading || !isIndexed">
            Ask
        </button>
        <div v-if="isLoading">Loading...</div>
        <div v-else>{{ answer }}</div>
        
    </div>

    <button @click="appStore.updateApiKey('')">Clear API Key</button>
    <button @click="appStore.clearCache()">Clear Cache</button>

  </div>
</template>

<script setup lang="ts">
import ChromeExImg from "../components/ChromeExImg.vue";
import { onMounted } from "vue";
import { storeToRefs } from 'pinia';
import { useAppStore } from "../store/app";
let question = "What about this article?";
let apiKey = "";
const appStore = useAppStore();
const { url, answer, error, isIndexed, tab, hasApiKey, pageId, isLoading } = storeToRefs(appStore);

const prettifyUrl = (url: string) => {
    if(url == "") return "";
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