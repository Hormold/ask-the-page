console.log("hello background");
import { ChromeRuntimeMessage } from './types/base';
import { SHA1 } from './utils/sha1';
const APP_URL = 'https://ask-the-page.herokuapp.com';



chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    console.log(`[background] request:`, request);
    (async () => {
        const api = await chrome.storage.sync.get(['apiKey']);
        switch (request.type) {
            case ChromeRuntimeMessage.GET_ACTIVE_TAB:
                console.log("[background] GET_ACTIVE_TAB");
                const tabs = await chrome.tabs.query({active: true, currentWindow: true});
                sendResponse({tab: tabs[0]});
                break;
            case ChromeRuntimeMessage.CHECK_API_KEY:
                console.log('[background] <- CHECK_API_KEY -> ' + api.apiKey);
                sendResponse({apiKey: api.apiKey || ''});
                break;
            case ChromeRuntimeMessage.SAVE_API_KEY:
                // Save the API key to local storage
                const saveRes = await chrome.storage.sync.set({apiKey: request.apiKey});
                console.log('[background] <- SAVE_API_KEY -> ' + request.apiKey, saveRes);
                sendResponse({apiKey: request.apiKey});
                break;
            case ChromeRuntimeMessage.INDEX_PAGE:
                console.log(`[background] INDEX_PAGE -> ${request.url}`);
                const indexResult = await indexUrl(request.url, api.apiKey);
                sendResponse(indexResult);
                break;
            case ChromeRuntimeMessage.ASK_QUESTION:
                console.log(`[background] ASK_QUESTION`);
                const result = await askQuestion(request.question, request.id, api.apiKey);
                sendResponse(result);
                break;

            case ChromeRuntimeMessage.CLEAR_CACHE:
                console.log(`[background] CLEAR_CACHE`);
                // Stay only apiKey
                const keys = await chrome.storage.sync.clear();
                // Set back the apiKey
                await chrome.storage.sync.set({apiKey: api.apiKey});
                sendResponse({success: true});
            default:
                console.log(`[background] Unknown message type: ${request.type}`);
                break;
        }
    })();
    return true;
  }  
);

const indexUrl = async (url: string, apiKey: string) => {
    const urlHash = SHA1(url);
    if(!apiKey) {
        console.log(`[INDEX] No API key`)
        return {success: false, error: 'No API key'};
    }

    // Check if we have a cached id for this url
    const cached = await chrome.storage.sync.get([urlHash]);
    if(cached[urlHash]) {
        const {id, expires} = cached[urlHash];
        if(expires > Date.now()) {
            console.log(`[INDEX] Using cached id: ${id}`)
            return {success: true, id};
        }
    }


    const response = await fetch(`${APP_URL}/index`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey,
        },
        body: JSON.stringify({url}),
    });
    const data = await response.json();
    if(data.success) {
        // Save url -> id mapping to local storage, but only for 1h
        await chrome.storage.sync.set({
            [urlHash]: {
                id: data.id,
                expires: Date.now() + 60 * 60 * 1000,
            }
        });
        console.log(`[INDEX] Saved id: ${data.id} for url: ${url} to local storage`);
    }
    return data;
};

const askQuestion = async (question: string, id: string, apiKey: string) => {
    const response = await fetch(`${APP_URL}/ask`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey,
        },
        body: JSON.stringify({query: question, id}),
    });
    const data = await response.json();
    console.log(`[ASK] ${data.success ? 'Success' : 'Error'}: ${data.answer}`, data);
    return data;
}
