"""Server for the API."""
import hashlib
import os
from datetime import datetime
from waitress import serve
from flask import Flask, request
from flask_cors import CORS
from app import parse_url, text_to_docs, embed_docs, search_docs, get_answer, get_sources
from openai.error import OpenAIError
from apscheduler.schedulers.background import BackgroundScheduler

app = Flask(__name__)
CORS(app)
INDEX = {}
PORT = int(os.environ.get("PORT", 5000))
is_on_heroku = os.environ.get("IS_HEROKU", None)
app.config["DEBUG"] = is_on_heroku is None

def gen_sha1(url: str) -> str:
    """Generates a sha1 hash from a URL, first 5 characters."""
    return hashlib.sha1(url.encode()).hexdigest()[:5]

# middleware to check for api key
@app.before_request
def check_api_key():
    """Checks for an API key in the request parameters."""
    api_key = request.args.get("api_key")
    if not api_key:
        api_key = request.headers.get("X-Api-Key")

    if not api_key or not api_key.startswith("sk-"):
        return {"success": False, "error": "No API key provided or invalid API key."}

    request.api_key = api_key

@app.route("/index", methods=["POST"])
def ind():
    """Indexes a URL and returns an ID."""
    content = request.json
    web_url = content['url']
    # Check is it is a valid URL and not indexed already
    if not web_url or not web_url.startswith("http"):
        return {
            "success": False,
            "error": "Invalid URL."
        }
    if web_url in [INDEX[id]["url"] for id in INDEX]:
        return {
            "success": True,
            "id": [id for id in INDEX if INDEX[id]["url"] == web_url][0]
        }
    api_key = request.api_key
    start = datetime.now()
    doc = parse_url(web_url)
    text = text_to_docs(doc)
    try:
        id = gen_sha1(web_url)
        print(f"Indexing {web_url} took {(datetime.now() - start).total_seconds()} seconds [{len(doc)} characters], next step: embedding...")
        INDEX[id] = {
            "index": embed_docs(text, api_key),
            "url": web_url,
            "text": text,
            "created_at": datetime.now()
        }
        print(f"Embedding {web_url} took {(datetime.now() - start).total_seconds()} seconds.")
    except OpenAIError as err:
        print('Index error', err._message)
        return {
            "success": False,
            "error": err._message
        }

    return {"success": True, "id": id}

@app.route("/ask", methods=["POST"])
def ask():
    """Returns an answer to a question."""
    api_key = request.api_key
    content = request.json
    query = content['query']
    doc_id = content['id']

    if not query or not doc_id:
        return {
            "success": False,
            "error": "Invalid query or ID."
        }
    if doc_id not in INDEX:
        return {
            "success": False,
            "error": "ID not found."
        }
    sources = search_docs(INDEX[doc_id]["index"], query)
    try:
        answer = get_answer(sources, api_key, query)
        sources = get_sources(answer, sources)

        sources_list = []
        for source in sources:
            sources_list.append({
                "page": source.metadata["page"],
                "chunk": source.metadata["chunk"],
                "source": source.metadata["source"],
                "page_content": source.page_content
            })

        return {
            "success": True,
            "answer": answer["output_text"].split("SOURCES: ")[0].lstrip().rstrip(),
            "sources": sources_list,
            "doc_id": doc_id,
        }
    except OpenAIError as err:
        print('Ask error', err._message)
        return {
            "success": False,
            "error": err._message
        }
        
    except Exception as err:
        print('Ask error', err)
        return {
            "success": False,
            "error": err
        }

# Clear index element created more than 1h ago, run every 5 minutes
@app.before_first_request
def clear_index():
    """Clears the index."""
    def run_job():
        """Runs the job."""
        for id in INDEX.items():
            if (datetime.now() - id[1]["created_at"]).total_seconds() > 3600:
                del INDEX[id[0]]
    run_job()
    scheduler = BackgroundScheduler()
    scheduler.add_job(func=run_job, trigger="interval", minutes=5)
    scheduler.start()

if is_on_heroku:
    serve(app, port=PORT)
    print("Server started on port", PORT)
else:
    app.run(port=PORT)