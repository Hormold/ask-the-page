export type Nullable<T> = T | null | undefined;

export const ChromeRuntimeMessage = {
  POPUP_CLICK: 'popupClick',
  GET_ACTIVE_TAB: 'getActiveTab',
  CHECK_API_KEY: 'checkApiKey',
  SAVE_API_KEY: 'saveApiKey',
  INDEX_PAGE: 'indexPage',
  ASK_QUESTION: 'askQuestion',
  CLEAR_CACHE: 'clearCache',
} as const;
