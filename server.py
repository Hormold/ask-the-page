"""Server for the API."""
import random
import string
from datetime import datetime
from flask import Flask, request
from flask_cors import CORS
from app import parse_url, text_to_docs, embed_docs, search_docs, get_answer, get_sources
from openai.error import OpenAIError
from apscheduler.schedulers.background import BackgroundScheduler

app = Flask(__name__)
CORS(app)
INDEX = {}
app.config["DEBUG"] = True

def gen_random_id():
    """Generates a random ID."""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=6))

# middleware to check for api key
@app.before_request
def check_api_key():
    """Checks for an API key in the request parameters."""
    api_key = request.args.get("api_key")
    if not api_key or not api_key.startswith("sk-"):
        return {"success": False, "error": "No API key provided or invalid."}

@app.route("/index", methods=["GET"])
def ind():
    """Indexes a URL and returns an ID."""
    web_url = request.args.get("url")
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
    api_key = request.args.get("api_key")
    doc = parse_url(web_url)
    text = text_to_docs(doc)
    try:
        id = gen_random_id()
        INDEX[id] = {
            "index": embed_docs(text, api_key),
            "url": web_url,
            "text": text,
            "created_at": datetime.now()
        }
    except OpenAIError as err:
        print('Index error', err._message)
        return {
            "success": False,
            "error": err._message
        }

    return {"success": True, "id": id}

@app.route("/ask", methods=["GET"])
def ask():
    """Returns an answer to a question."""
    query = request.args.get("query")
    api_key = request.args.get("api_key")
    doc_id = request.args.get("id")
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


app.run()