import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { ChromeRuntimeMessage } from "../types/base";
import { Nullable } from "../types/base";

export interface IApp {
  activeUrl?: string;
  tabData?: object;
  apiKey?: boolean;
  isIndexed?: boolean;
}

export interface ITab {
    favIconUrl: string;
    id: number;
}

const getActiveTab = (interactive: boolean) => {
  return new Promise<any>(resolve => {
    const msg = { 
      type : ChromeRuntimeMessage.GET_ACTIVE_TAB, 
      interactive: interactive,
    };
    chrome.runtime.sendMessage(msg, (response) => {
        if(response)
            resolve(response.tab)
    })
  });
}

const checkApiKey = async () => {
     return new Promise<any>(resolve => {
    const msg = { 
      type : ChromeRuntimeMessage.CHECK_API_KEY,
    };
    chrome.runtime.sendMessage(msg, (response) => {
        resolve(response)
    })
  });
}

const indexPage = async (urlToIndex) => {
    return new Promise<any>(resolve => {
        const msg = {
            type: ChromeRuntimeMessage.INDEX_PAGE,
            url: urlToIndex,
        };
        chrome.runtime.sendMessage(msg, (response) => {
            resolve(response)
        })
    });
}

const askQuestion = async (question: string) => {
    return new Promise<any>(resolve => {
        const msg = {
            type: ChromeRuntimeMessage.ASK_QUESTION,
            question,
        };
        chrome.runtime.sendMessage(msg, (response) => {
            resolve(response)
        })
    });
}

export const useAppStore = defineStore('app', () => {

    const appRef = ref<Nullable<IApp>>(null);
    const isIndexed = computed<boolean>(() => appRef.value?.isIndexed || false);
    const url = computed<string>(() => appRef.value?.activeUrl || '');
    const tab = computed<any>(() => appRef.value?.tabData || {});

    const init = async () => {
        const apiKey = await checkApiKey();
        const activeTab = await getActiveTab(true);
        appRef.value = {
            activeUrl: activeTab.url,
            tabData: activeTab,
            apiKey: apiKey.apiKey ? true : false,
        };

        indexPage(activeTab.url);
    };

    
        
    return {
        init,
        isIndexed,
        appRef,
        url,
        tab,
        askQuestion,
    };
});