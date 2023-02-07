<template>
  <div class="googlelogin-button" 
    :style="[computedWidth, computedHeight]">
    <svg class="googlelogin-button--icon" 
      aria-hidden="true"
      width="24" 
      height="24" 
      viewBox="0 0 18 18">
      <path d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z" 
        fill="#4285F4"
      ></path>
      <path d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z" 
        fill="#34A853">
      </path>
      <path d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z" 
        fill="#FBBC05"
      ></path>
      <path d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z" 
        fill="#EA4335"
      ></path>
    </svg>
    <div class="googlelogin-button--txt">Google Login</div>
    <div></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { BoxSizeUnit } from "../types/css";
import { generateBoxSize } from "../utils/cssUtils";
const props = defineProps<{
  width?: number,
  wUnit?: BoxSizeUnit,
  height?: number,
  hUnit?: BoxSizeUnit,
}>();
const computedWidth = computed(() => props.width ? generateBoxSize(props.width, props.wUnit ?? 'px', 'width') : '')
const computedHeight = computed(() => props.height ? generateBoxSize(props.height, props.hUnit ?? 'px', 'height') : '')
</script>

<style scoped>
.googlelogin-button {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background-color: #f2f3f5;
  font-size: 12px;
  border-radius: 10px;
  user-select: none;
}
.googlelogin-button:hover {
  background-color: #e1e4e7;
}
</style>