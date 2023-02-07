import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { ChromeRuntimeMessage } from "../types/base";
import { Nullable } from "../types/base";

export interface IApp {
    error?: string;
    activeUrl?: string;
    tabData?: object;
    apiKey?: boolean;
    isIndexed?: boolean;
    pageId?: string;
    answer?: string;
    sources?: any[];
    isLoading?: boolean;
}

export interface ITab {
    favIconUrl: string;
    id: number;
}

const getActiveTab = (interactive: boolean) => {
  return new Promise<any>(resolve => {
    const msg = { 
      type : ChromeRuntimeMessage.GET_ACTIVE_TAB,
    };
    chrome.runtime.sendMessage(msg, (response) => {
        if(response)
            resolve(response.tab)
    })
  });
}

const checkApiKey = async () => {
    return new Promise<any>(resolve => {
      chrome.runtime.sendMessage({ 
        type: ChromeRuntimeMessage.CHECK_API_KEY,
      }, (response) => {
        console.log(`checkApiKey:`, response)
        resolve(response)
      })
  });
}

const saveApiKey = async (apiKey: string) => {
    return new Promise<any>(resolve => {
        const msg = {
            type: ChromeRuntimeMessage.SAVE_API_KEY,
            apiKey: apiKey,
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
            console.log(`We got a response from the background script:`, response)
            resolve(response)
        })
    });
}

const sendQuestion = async (question: string, pageId: string) => {
    return new Promise<any>(resolve => {
        const msg = {
            type: ChromeRuntimeMessage.ASK_QUESTION,
            question,
            id: pageId,
        };
        chrome.runtime.sendMessage(msg, (response) => {
            resolve(response)
        })
    });
}

export const useAppStore = defineStore('app', () => {
    const appRef = ref<Nullable<IApp>>(null);
    const setErrorMessage = (error: string) => {
        appRef.value = {
            ...appRef.value,
            error,
        };
    };
    const setLoader = (isLoading: boolean) => {
        appRef.value = {
            ...appRef.value,
            isLoading,
        };
    };

    const isLoading = computed<boolean>(() => appRef.value?.isLoading || false);
    const isIndexed = computed<boolean>(() => appRef.value?.isIndexed || false);
    const url = computed<string>(() => appRef.value?.activeUrl || '');
    const tab = computed<any>(() => appRef.value?.tabData || {});
    const error = computed<string>(() => appRef.value?.error || '');
    const pageId = computed<string>(() => appRef.value?.pageId || '');
    const hasApiKey = computed<boolean>(() => appRef.value?.apiKey || false);
    const answer = computed<string>(() => appRef.value?.answer || '');


    const askQuestion = async (question: string) => {
        if(!appRef.value?.activeUrl || !appRef.value?.pageId || !appRef.value?.isIndexed || !appRef.value?.isIndexed)
            return setErrorMessage('No active URL or page is not indexed');
        if(!question) 
            return setErrorMessage('No question provided');
        setLoader(true);
        const result = await sendQuestion(question, appRef.value?.pageId);
        if(result.success) {
            appRef.value = {
                ...appRef.value,
                answer: result.answer,
                sources: result.sources,
            };
        }
        setLoader(false);
    };


    const requestIndex = async () => {
        if(!appRef.value?.activeUrl)
            return setErrorMessage('No active URL');
        const result = await indexPage(appRef.value?.activeUrl);
        if(result.success) {
            appRef.value = {
                ...appRef.value,
                isIndexed: true,
                pageId: result.id,
            };
        } else {
            setErrorMessage(result.error);
        }
    };

    const updateApiKey = async (apiKey: string) => {
        // Validate API key
        if (!apiKey.startsWith('sk-')) {
           return setErrorMessage('Invalid OpenAI API key');
        }
        const result = await saveApiKey(apiKey);
        if(result.apiKey) {
            const hasKey = await checkApiKey();
            appRef.value = {
                ...appRef.value,
                apiKey: hasKey.apiKey ? true : false,
            };
            requestIndex();
        }
    };


    const init = async () => {
        const apiKey = await checkApiKey();
        const activeTab = await getActiveTab(true);
        appRef.value = {
            activeUrl: activeTab.url,
            tabData: activeTab,
            apiKey: apiKey.apiKey ? true : false,
        };

        requestIndex();
    };

    const clearCache = async () => {
        await chrome.runtime.sendMessage({
            type: ChromeRuntimeMessage.CLEAR_CACHE,
        });
    };
    

        
    return {
        init,
        error,
        isIndexed,
        appRef,
        url,
        tab,
        isLoading,
        pageId,
        answer,


        askQuestion,
        hasApiKey,
        updateApiKey,
        clearCache
    };
});