<template>
  <div class="contentsview">
    <p>ask?</p>
    Current URL: {{ url }}
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { storeToRefs } from 'pinia';
import { useAppStore } from "../store/app";

const appStore = useAppStore();
const { url, isIndexed } = storeToRefs(appStore);

onMounted(() => { 
    appStore.init();    
});
</script>

<style scoped>
.contentsview {
  position: fixed;
  top: 10px;
  right: 10px;
  width: 200px;
  padding: 5px;
  border-radius: 10px;
  background-color: white;
  font-size: 12px;
  z-index: 100;
  color: black;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
}

.contentsview__user-icon img {
  width: 40px;
  border-radius: 20px;
}

.contentsview__user {
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.contentsview__user-logout {
  padding: 3px 12px;
  border-radius: 10px;
  background-color: white;
  border: 1px solid gray;
  color: black;
}

.contentsview__user-logout:hover {
  background-color: lightgray;
}
</style>