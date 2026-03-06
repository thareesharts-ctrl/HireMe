<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white" alt="Google Gemini API" />
</div>

<h1 align="center">HireMe: AI-Powered Recruitment & Assessment Platform</h1>

<p align="center">
  An advanced, AI-driven hiring pipeline bridging the gap between recruiters and candidates. Featuring automated Applicant Tracking Systems (ATS), intelligent resume scanning, dynamic mock interviews, and automated technical assessments.
</p>

---

## 🚀 Features

### 🏢 For Recruiters (Recruiter Dashboard)
* **Job Postings Management:** Seamlessly post job openings with custom descriptions, roles, and vacancy counts.
* **Smart Candidate Search:** Automatically filters incoming applications specific to your unique job postings.
* **Extensive Applicant Profiling:** View comprehensive data out of the box—ATS match percentage, Technical Assessment scores, APAAR IDs, GitHub/LinkedIn links, domains, and core skills.
* **Instant Accept/Reject Pipeline:** Easily visualize applicant scores to trigger Accept or Reject workflows dynamically.

### 🎓 For Candidates (Applier Dashboard)
* **AI Resume Scanning & ATS Feedback:** Upload resumes to receive a granular breakdown of strengths, missing keywords, and algorithmic matches against top skills.
* **Community Job Postings:** A native board linking straight to localized Recruiter posts. Click "Apply Now" to sync your profile over securely.
* **Automated Assessment Scheduling:** Upon application, candidates are dynamically queued into a strictly-timed (60 Minute) 40-Question logic/technical assessment.
* **AI Career Companion:** Integrated conversational Bot for mock interviews, career guidance, and instant help.

---

## 🛠️ Tech Stack

**Frontend:**
- React.js
- React Router DOM
- Vite
- Axios (HTTP Client)
- Vanilla CSS (Premium Glassmorphism & Modern Soft-UI aesthetics)
- Lucide React (Iconography)

**Backend:**
- Python 3
- Flask (REST API)
- MongoDB / PyMongo (Database)
- PyPDF2 (Resume PDF processing)
- Google Generative AI (Gemini 2.0 Flash/Flash-Lite - Core Logic Engine)
- Werkzeug (Secure Password Hashing)

---

## ⚙️ Local Development Setup

### Prerequisites
Make sure you have Node.js, Python 3.9+, and an active MongoDB URI cluster ready.

### 1. Clone the Repository
```bash
git clone https://github.com/thareesharts-ctrl/HireMe.git
cd HireMe
```

### 2. Configure the Backend (Flask server)
Navigate to the `backend/` directory, create your virtual environment, and install dependencies:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
pip install -r requirements.txt
```
**Environment Variables:** Create a `.env` file in the `backend/` folder.
```env
MONGO_URI=your_mongodb_cluster_connection_string
GEMINI_API_KEYS=your_google_gemini_api_key
```

Run the backend server:
```bash
python app.py
```
*The backend API will boot up on `http://localhost:5000`.*

### 3. Configure the Frontend (React Vite)
Open a new terminal session, navigate to the `frontend/` directory, and start the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```
*The frontend interface will boot up on `http://localhost:5173`.*

---

## 📡 Core API Structure
* `/api/login` & `/api/register` - Secure JWT/Hash based authentication.
* `/api/jobs` & `/api/post_job` - Operations powering the global Community Postings.
* `/api/apply_job` - Synced cross-reference triggering applicant assessments.
* `/api/submit_assessment` - Calculates and writes candidate technical scores.
* `/api/analyze` & `/api/generate_test` - Integrated AI pathways powering generative grading.

---

## 🔒 Security
- Employs `werkzeug.security` module for hashing client passwords prior to DB injection.
- Isolated API routes blocking access to non-authenticated queries.
- Protected client-side layouts locking users out of AI-Assistants during timed Job Assessment testing.

---

<p align="center">
  Designed & Built with passion by <b><a href="https://github.com/thareesharts-ctrl">thareesharts-ctrl</a></b>
</p>
