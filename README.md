# WIP: Ask The Page
Chrome extension to ask questions about the current page using OpenAI GPT-3 API.
It contains two parts: a Chrome extension and a backend server (written in Python).
Backend server is used to store indexed pages and not saving any user data like questions and api keys.

![How it looks now](https://github.com/Hormold/ask-the-page/blob/master/docs/demo.jpeg?raw=true)
## Installation
### Backend server (Self-hosted)
1. Install [Poetry](https://python-poetry.org/docs/#installation)
2. Run ```poetry install```
3. Run ```poetry shell```
4. And then ```python3 server.py```

## Or use hosted on Heroku: https://ask-the-page.herokuapp.com/

### Chrome extension
1. Go to `chrome://extensions/`
2. Enable developer mode
3. Click on `Load unpacked` and select `chrome-extension` folder

## Help needed to improve this project UI/UX in Chrome extension! Please, contact me if you want to help.