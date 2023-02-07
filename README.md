# WIP: Ask The Page
Chrome extension to ask questions about the current page using OpenAI GPT-3 API.
It contains two parts: a Chrome extension and a backend server (written in Python).
Backend server is used to store indexed pages and not saving any user data like questions and api keys.


## Installation
### Backend server
1. Install Python 3.7+
2. Install requirements: `pip install -r requirements.txt`


### Chrome extension
1. Go to `chrome://extensions/`
2. Enable developer mode
3. Click on `Load unpacked` and select `chrome-extension` folder
4. Go to `chrome-extension/options.html` and set your backend server url (default is hosted on Heroku - https://ask-the-page.herokuapp.com/)
5. Go to `chrome-extension/popup.html` and set your OpenAI API key (you can get it from https://beta.openai.com/)

