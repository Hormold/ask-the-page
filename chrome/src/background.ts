console.log("hello background");
import { ChromeRuntimeMessage } from './types/base';
const APP_URL = 'https://ask-the-page.herokuapp.com';

chrome.runtime.onMessage.addListener(
  async (request, sender, sendResponse) => {
    console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
    if (request.type === ChromeRuntimeMessage.GET_ACTIVE_TAB) {
      console.log("[background] GET_ACTIVE_TAB");
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        sendResponse({tab: tabs[0]});
      });
    }
    if(request.type === ChromeRuntimeMessage.CHECK_API_KEY) {
        // Get the API key from local storage
        chrome.storage.sync.get(['apiKey'], (result) => {
            console.log('API Key Value currently is ' + result.apiKey);
            sendResponse({apiKey: result.apiKey});
        });
    }

    if(request.type === ChromeRuntimeMessage.SAVE_API_KEY) {
        // Save the API key to local storage
        chrome.storage.sync.set({apiKey: request.apiKey}, () => {
            console.log('API Key Value is set to ' + request.apiKey);
            sendResponse({apiKey: request.apiKey});
        });
    }

    if(request.type === ChromeRuntimeMessage.INDEX_PAGE) {
        console.log(`[background] INDEX_PAGE`);
        const result = indexUrl(request.url, request.apiKey);
        sendResponse({result});
    }
    return true;
  }
  
);

const indexUrl = async (url: string, apiKey: string) => {
    const response = await fetch(`${APP_URL}/index`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey,
        },
        body: JSON.stringify({url}),
    });
    const data = await response.json();
    console.log(`response:`, data);
    return data;
}