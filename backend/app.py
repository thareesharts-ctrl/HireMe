from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2
import io
import re
import random
import os
import json
import time
from dotenv import load_dotenv
import google.generativeai as genai
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash

# Load environment
load_dotenv(os.path.join(os.getcwd(), '.env'), override=True)
load_dotenv(os.path.join(os.getcwd(), 'backend', '.env'), override=True)

def get_all_api_keys():
    """Returns the full list of available Gemini API keys."""
    raw_keys = os.environ.get("GEMINI_API_KEYS")
    if not raw_keys:
        return []
    return [k.strip() for k in raw_keys.split(",") if k.strip()]

# Global collection references
users_collection = None

def get_db_collection():
    global users_collection
    if users_collection is not None: return users_collection
    try:
        current_uri = os.environ.get("MONGO_URI") or os.environ.get("MONGO_URL")
        print(f"DEBUG DB: Connecting with URI {current_uri[:25]}...")
        import dns.resolver
        dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
        dns.resolver.default_resolver.nameservers = ['8.8.8.8', '8.8.4.4', '1.1.1.1']

        client = MongoClient(current_uri, serverSelectionTimeoutMS=5000)
        db = client['resume_analyzer']
        users_collection = db['users']
        return users_collection
    except Exception as e:
        print(f"DATABASE ERROR: {e}")
        return None


app = Flask(__name__)
CORS(app)

# --- AI CORE LOGIC ---
MODELS_TO_TRY = ['models/gemini-2.0-flash-lite', 'models/gemini-2.0-flash', 'models/gemini-1.5-flash']

def call_gemini(prompt, is_chat=False, history=None, system_instruction=None):
    keys = get_all_api_keys()
    random.shuffle(keys)
    
    last_error = "No keys available"
    
    for key in keys:
        genai.configure(api_key=key)
        for model_name in MODELS_TO_TRY:
            try:
                # Add a tiny artificial delay to not spam Google's rate limiter across keys
                time.sleep(0.5) 
                model = genai.GenerativeModel(model_name, system_instruction=system_instruction)
                if is_chat:
                    chat_history = []
                    if history:
                        for m in history:
                            role = "user" if m.get("role") == "user" else "model"
                            chat_history.append({"role": role, "parts": [m.get("content", "")]})
                    
                    chat = model.start_chat(history=chat_history)
                    # Use a slightly different call for chat
                    response = chat.send_message(prompt)
                else:
                    response = model.generate_content(prompt)
                
                if response and response.text:
                    return response.text, None
            except Exception as e:
                err_str = str(e)
                last_error = err_str
                # If it's a 404 (model not found), try next model immediately
                if "404" in err_str:
                    continue
                # If it's a 429 (rate limit), try next key
                if "429" in err_str or "quota" in err_str.lower():
                    break # try next key
                # Other errors, log and try next
                print(f"Model {model_name} failed with key {key[:5]}: {err_str[:100]}")
                continue
                
    return None, last_error

# --- ROUTES ---

@app.route("/api/generate-roadmap", methods=["POST"])
def generate_roadmap():
    domain = request.json.get("domain", "Full Stack Development")
    system_instr = "You are a Senior Career Architect. Generate a concise, high-value professional career roadmap in Markdown."
    prompt = f"Create a structured career roadmap for: {domain}. Include 3 phases, top 3 projects, and 3 FAANG interview tips."
    
    text, error = call_gemini(prompt, system_instruction=system_instr)
    if text:
        return jsonify({"success": True, "roadmap": text})
    
    return jsonify({
        "success": True, # Still success but with a warning message in the roadmap field
        "roadmap": f"# ⚠️ AI Network Busy\n\nAll 7 API keys have reached their free tier limit. Please wait **60 seconds** and try again.\n\n*Technical Detail: {error}*"
    })

@app.route("/api/ai_mock_interview", methods=["POST"])
def ai_mock_interview():
    data = request.json
    domain = data.get("domain", "Full Stack")
    level = data.get("level", "Intermediate")
    history = data.get("history", [])
    
    system_instr = f"You are Alex, a FAANG Principal Engineer. Conduct a rigorous technical interview for {domain} ({level} level). Be professional, critical, and keep responses under 3 sentences."
    
    user_msg = "Let's start the interview."
    if history and history[-1]["role"] == "user":
        user_msg = history[-1]["content"]
        history = history[:-1] # Remove last message to pass as history

    text, error = call_gemini(user_msg, is_chat=True, history=history, system_instruction=system_instr)
    if text:
        return jsonify({"success": True, "reply": text})
    return jsonify({"error": f"Service Busy: {error}"}), 500

@app.route("/api/chat", methods=["POST"])
def chat_assistant():
    messages = request.json.get("messages", [])
    if not messages: return jsonify({"error": "No messages"}), 400
    
    system_instr = "You are the HireMe Career Assistant. Helpful, professional, and focused ONLY on career/resume topics."
    user_msg = messages[-1]["content"]
    history = messages[:-1]
    
    text, error = call_gemini(user_msg, is_chat=True, history=history, system_instruction=system_instr)
    if text:
        return jsonify({"success": True, "reply": text})
    return jsonify({"success": True, "reply": "I'm a bit overwhelmed right now. Please try again in a minute!"})

@app.route("/api/analyze", methods=["POST"])
def analyze_resume():
    file = request.files.get("file")
    if not file: return jsonify({"error": "No file"}), 400
    
    try:
        pdf_bytes = io.BytesIO(file.read())
        reader = PyPDF2.PdfReader(pdf_bytes)
        text = " ".join([page.extract_text() for page in reader.pages])
        
        # Super simple skill detection
        skills = ["Python", "Java", "JavaScript", "React", "Node.js", "AWS", "Docker", "SQL", "MongoDB"]
        found = [s for s in skills if s.lower() in text.lower()]
        score = min(100, len(found) * 10 + 30)
        
        return jsonify({
            "success": True,
            "data": {
                "score": score,
                "skills": found,
                "feedback": ["Strong resume structure.", f"Good mix of {len(found)} core skills."]
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

from fallback_questions import get_fallback_questions

@app.route("/api/generate-test", methods=["POST"])
def generate_test():
    skills = request.json.get("skills", [])
    if not skills:
        skills = ["General Software Engineering"]
    
    system_instr = "You are a technical assessment generator. Always return the output ONLY as a valid JSON object."
    prompt = f"""Generate a 30-question multiple-choice technical assessment test based on the following skills: {', '.join(skills)}.
The output MUST be a valid JSON object with a single root key "questions", containing an array of 30 question objects.
Each question object MUST have the following keys:
- "id": a unique integer from 1 to 30
- "question": the question text
- "options": an array of 4 string options
- "correctAnswer": the exact string of the correct option

Example format:
{{
  "questions": [
    {{
      "id": 1,
      "question": "What does HTML stand for?",
      "options": ["Hyper Text Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language", "Hyper Tool Markup Language"],
      "correctAnswer": "Hyper Text Markup Language"
    }}
  ]
}}"""

    text, error = call_gemini(prompt, system_instruction=system_instr)
    if not text:
        print(f"Service Busy or Error: {error}. Using fallback questions.")
        return jsonify({"success": True, "questions": get_fallback_questions(skills)})

    # Extract JSON from the response text
    try:
        # Sometimes Gemini wraps JSON in markdown blocks
        match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
        if match:
            json_str = match.group(1)
        else:
            json_str = text.strip()
            
        data = json.loads(json_str)
        return jsonify({"success": True, "questions": data.get("questions", [])})
    except Exception as e:
        print(f"JSON Parse Error: {e}\nRaw output: {text}. Using fallback questions.")
        return jsonify({"success": True, "questions": get_fallback_questions(skills)})



@app.route("/api/register", methods=["POST"])
def register():
    coll = get_db_collection()
    if coll is None: return jsonify({"error": "DB Down"}), 500
    data = request.json
    if coll.find_one({"email": data.get("email")}): return jsonify({"error": "Email exists"}), 400
    coll.insert_one({
        "name": data.get("name"), 
        "email": data.get("email"), 
        "password": generate_password_hash(data.get("password")),
        "role": data.get("role", "user")
    })
    return jsonify({"success": True})

@app.route("/api/login", methods=["POST"])
def login():
    coll = get_db_collection()
    if coll is None: return jsonify({"error": "DB Down"}), 500
    data = request.json
    user = coll.find_one({"email": data.get("email")})
    if user and check_password_hash(user["password"], data.get("password")):
        return jsonify({"success": True, "user": {"name": user["name"], "email": user["email"], "role": user.get("role", "user")}})
    return jsonify({"error": "Invalid login"}), 401



@app.route("/api/update_analytics", methods=["POST"])
def update_analytics():
    coll = get_db_collection()
    if coll is None: return jsonify({"error": "DB Down"}), 500
    data = request.json
    coll.update_one({"email": data.get("email")}, {"$set": {"atsScore": data.get("atsScore"), "testScore": data.get("testScore")}}, upsert=True)
    return jsonify({"success": True})

@app.route("/api/submit_assessment", methods=["POST"])
def submit_assessment():
    coll = get_db_collection()
    if coll is None: return jsonify({"error": "DB Down"}), 500
    data = request.json
    coll.update_one({"email": data.get("email")}, {"$set": {"testScore": data.get("testScore")}}, upsert=True)
    return jsonify({"success": True})

@app.route("/api/candidates", methods=["GET"])
def get_candidates():
    coll = get_db_collection()
    if coll is None: return jsonify({"error": "DB Down"}), 500
    users = coll.find({"role": {"$ne": "recruiter"}}, {"password": 0})
    res = []
    for u in users:
        res.append({
            "id": str(u["_id"]), "name": u.get("name", "User"), "email": u["email"],
            "atsScore": u.get("atsScore", 0), "testScore": u.get("testScore", None), "status": "Reviewing"
        })
    return jsonify({"success": True, "candidates": res})

@app.route("/api/update_profile", methods=["POST"])
def update_profile():
    coll = get_db_collection()
    if coll is None: return jsonify({"error": "DB Down"}), 500
    data = request.json
    email = data.pop("email", None)
    if not email: return jsonify({"error": "Email missing"}), 400
    # Update user document with profile details
    coll.update_one({"email": email}, {"$set": {"profileData": data}}, upsert=True)
    return jsonify({"success": True})

@app.route("/api/apply_job", methods=["POST"])
def apply_job():
    try:
        current_uri = os.environ.get("MONGO_URI") or os.environ.get("MONGO_URL")
        client = MongoClient(current_uri, serverSelectionTimeoutMS=5000)
        apps_coll = client['resume_analyzer']['applications']
        data = request.json
        # Check if already applied
        if apps_coll.find_one({"candidateEmail": data.get("candidateEmail"), "jobId": data.get("jobId")}):
            return jsonify({"error": "Already applied to this job"}), 400
        apps_coll.insert_one(data)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/recruiter_candidates", methods=["GET"])
def get_recruiter_candidates():
    try:
        current_uri = os.environ.get("MONGO_URI") or os.environ.get("MONGO_URL")
        client = MongoClient(current_uri, serverSelectionTimeoutMS=5000)
        apps_coll = client['resume_analyzer']['applications']
        coll = get_db_collection()
        recruiter_email = request.args.get('email')
        
        apps = list(apps_coll.find({"recruiterEmail": recruiter_email}))
        res = []
        for app in apps:
            u = coll.find_one({"email": app.get("candidateEmail")})
            if u:
                res.append({
                    "id": str(app["_id"]), 
                    "name": u.get("name", "User"), 
                    "email": u["email"],
                    "role": app.get("jobRole", "N/A"),
                    "date": app.get("appliedDate", "N/A"),
                    "atsScore": u.get("atsScore", 0), 
                    "testScore": u.get("testScore", None), 
                    "status": app.get("status", "Reviewing"),
                    "profile": u.get("profileData", {})
                })
        return jsonify({"success": True, "candidates": res})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/update_recruiter_profile", methods=["POST"])
def update_recruiter_profile():
    coll = get_db_collection()
    if coll is None: return jsonify({"error": "DB Down"}), 500
    data = request.json
    coll.update_one({"email": data.get("email")}, {"$set": {"recruiter_profile": data}}, upsert=True)
    return jsonify({"success": True})

@app.route("/api/post_job", methods=["POST"])
def post_job():
    try:
        current_uri = os.environ.get("MONGO_URI") or os.environ.get("MONGO_URL")
        client = MongoClient(current_uri, serverSelectionTimeoutMS=5000)
        jobs_coll = client['resume_analyzer']['jobs']
        data = request.json
        jobs_coll.insert_one(data)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/jobs", methods=["GET"])
def get_jobs():
    try:
        current_uri = os.environ.get("MONGO_URI") or os.environ.get("MONGO_URL")
        client = MongoClient(current_uri, serverSelectionTimeoutMS=5000)
        jobs_coll = client['resume_analyzer']['jobs']
        jobs = list(jobs_coll.find({}))
        for job in jobs:
            job["_id"] = str(job["_id"])
        return jsonify({"success": True, "jobs": jobs[::-1]}) # Return newest first
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print(f"--- STARTING AI RESUME ANALYZER (KEY POOL ACTIVE) ---")
    app.run(debug=True, host='0.0.0.0', port=5000)


