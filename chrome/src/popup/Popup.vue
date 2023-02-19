<template>
  <div class="popupview">
    <ChromeExImg v-if="tab.favIconUrl === undefined" :filename="'icon-128.png'" class="favico" />
    <img v-else :src="tab.favIconUrl" />
    <div v-if="error">{{ error }}</div>
    <p>
        Ask The Page 
        <span :class='{spinner: !isIndexed}'>{{(isIndexed?'✅':'🔄')}}</span>
    </p> 
    <small>{{ prettifyUrl(url) }} {{ pageId?`(${pageId})`:'' }}</small>

    <div v-if="!hasApiKey">
        <p>Enter your API key:</p>
        <input type="text" v-model="apiKey" class="form-control" />
        <button @click="appStore.updateApiKey(apiKey)" class="btn btn-sm btn-primary">Save</button>
    </div>
    <div v-else>
        <div class="text-center">
            Input your question here:
            <input type="text" v-model="question" class="form-control small" />
            
            <button @click="appStore.askQuestion(question)" :disabled="isLoading || !isIndexed" class="btn btn-sm btn-success mt-2">
                Ask question
            </button>
        </div>
        <div v-if="isLoading" class="text-muted">Loading...</div>
        
        <div class="answer" v-else-if="answer">
            {{ answer }}
            <i class="far fa-copy copy-btn" @click="copyAnswer"></i>
        </div>

        
    </div>
    <div class="right-corner-buttons">
            <button class="btn btn-ultra-sm btn-primary btn-block" @click="appStore.updateApiKey('')">Clear API Key</button>

           <button class="btn btn-ultra-sm btn-primary btn-block" @click="appStore.clearCache()">Clear Cache</button>
    </div>
    
    

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

const copyAnswer = () => {
    navigator.clipboard.writeText(answer.value);
}

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

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}


.spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #3498db;
    border-radius: 50%;
    animation: spin 2s linear infinite;
}


.answer {
    border: 1px solid #ccc;
    padding: 5px;
    margin: 5px;
    border-radius: 5px;
    background-color: #eee;
}

small {
    font-size: 10px;
    color: #666;
}

.favico {
    max-width: 60px;
    max-height: 60px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.btn-ultra-sm {
    padding: 0px;
    font-size: 10px;
    height: 20px;
}

.right-corner-buttons {
    position: absolute;
    top: 3px;
    right: 3px;
    display: flex;
    flex-flow: column;
    gap: 2px;
}
.small {
    font-size: 11px;
    text-align: center;
}
.copy-btn {
    cursor: pointer;
}
</style>