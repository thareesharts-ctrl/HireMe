import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
    UploadCloud,
    CheckCircle,
    AlertCircle,
    FileText,
    Activity,
    Layers,
    Tag,
    RefreshCw,
    Clock,
    PlayCircle,
    ArrowLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';

function ResumeScanner() {
    // Main app state
    const [, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    // Test Assessment State
    const [testState, setTestState] = useState('idle'); // idle, loading, active, finished
    const [questions, setQuestions] = useState([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 mins in seconds
    const [testScore, setTestScore] = useState(0);
    const [warnings, setWarnings] = useState(0);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [cooldownLeft, setCooldownLeft] = useState(null);
    const navigate = useNavigate();

    // Get current user email for scoped analytics
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = currentUser.email || 'guest';
    const analyticsKey = `userAnalytics_${userEmail}`;

    // Timer Effect for Assessment
    useEffect(() => {
        let timer;
        if (testState === 'active' && timeLeft > 0 && !showWarningModal) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && testState === 'active') {
            finishTest();
        }
        return () => clearInterval(timer);
    }, [testState, timeLeft, showWarningModal]);

    // Anti-Cheat Effect
    useEffect(() => {
        if (testState !== 'active') return;

        const handleVisibilityChange = () => {
            if (document.hidden && !showWarningModal) {
                triggerWarning("Tab switching or minimizing is not allowed.");
            }
        };

        const handleFullScreenChange = () => {
            if (!document.fullscreenElement && !showWarningModal) {
                triggerWarning("Exiting full screen is not allowed.");
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        document.addEventListener("fullscreenchange", handleFullScreenChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            document.removeEventListener("fullscreenchange", handleFullScreenChange);
        };
    }, [testState, warnings, showWarningModal]);

    const triggerWarning = (reason) => {
        if (warnings >= 4) {
            alert(`Anti-Cheat Auto-Submission: ${reason} Maximum warnings (5) reached.`);
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(e => console.log(e));
            }
            finishTest();
        } else {
            setWarnings(prev => prev + 1);
            setShowWarningModal(true);
        }
    };

    const resumeTest = async () => {
        try {
            await document.documentElement.requestFullscreen();
            setShowWarningModal(false);
        } catch (e) {
            alert("You must allow full screen to continue.");
        }
    };

    // Cooldown Timer Effect
    useEffect(() => {
        let timer;
        if (cooldownLeft !== null && cooldownLeft > 0) {
            timer = setInterval(() => {
                setCooldownLeft(prev => prev - 1);
            }, 1000);
        } else if (cooldownLeft === 0) {
            setCooldownLeft(null);
            startAssessment();
        }
        return () => clearInterval(timer);
    }, [cooldownLeft]);

    // Handle Drag & Drop
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileSelection(e.target.files[0]);
        }
    };

    const handleFileSelection = (selectedFile) => {
        setError(null);
        if (selectedFile.type !== 'application/pdf') {
            setError("Please upload a valid PDF document to proceed.");
            return;
        }
        setFile(selectedFile);
        uploadResume(selectedFile);
    };

    const uploadResume = async (fileToUpload) => {
        setLoading(true);
        setResults(null);
        setTestState('idle'); // Reset test state if new resume

        const formData = new FormData();
        formData.append('file', fileToUpload);

        try {
            const response = await axios.post('http://localhost:5000/api/analyze', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data && response.data.success) {
                // Post ATS Score to Backend for recruiter dashboard
                if (userEmail !== 'guest') {
                    axios.post('http://localhost:5000/api/update_analytics', {
                        email: userEmail,
                        atsScore: response.data.data.score
                    }).catch(e => console.error("Failed to sync ATS score to backend", e));
                }

                setTimeout(() => {
                    setResults(response.data.data);
                    setLoading(false);
                    setCooldownLeft(180); // Start 3 min cooldown
                }, 1200);
            } else {
                throw new Error("Analysis failed");
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || "We could not reach the analysis server. Please ensure the backend API is running.");
            setLoading(false);
            setFile(null);
        }
    };

    // Assessment Setup
    const startAssessment = async () => {
        try {
            await document.documentElement.requestFullscreen();
        } catch (e) {
            alert("Please enable full screen to take the assessment.");
            return;
        }

        setTestState('loading');
        setWarnings(0);
        try {
            const response = await axios.post('http://localhost:5000/api/generate-test', {
                skills: results.skills
            });

            if (response.data && response.data.success) {
                setQuestions(response.data.questions);
                setCurrentQIndex(0);
                setAnswers({});
                setTimeLeft(30 * 60); // Reset timer to 30 mins

                setTimeout(() => {
                    setTestState('active');
                }, 1200);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to generate the assessment test. Ensure the backend is running.");
            setTestState('idle');
        }
    };

    const handleAnswer = (qId, option) => {
        setAnswers(prev => ({ ...prev, [qId]: option }));
    };

    const finishTest = () => {
        let correct = 0;
        questions.forEach(q => {
            if (answers[q.id] === q.correctAnswer) {
                correct++;
            }
        });
        const percentage = Math.round((correct / questions.length) * 100);
        setTestScore(percentage);

        // Save analytics to localStorage scoped by email
        const existingData = JSON.parse(localStorage.getItem(analyticsKey) || '{}');
        const newData = {
            ...existingData,
            atsScore: results?.score || existingData.atsScore,
            mockScore: percentage,
            mockDomain: 'Extracted Skills',
            skills: results?.skills || existingData.skills,
            feedback: results?.feedback || existingData.feedback,
            lastMockDate: new Date().toISOString()
        };
        localStorage.setItem(analyticsKey, JSON.stringify(newData));

        // Push test score to Backend
        if (userEmail !== 'guest') {
            axios.post('http://localhost:5000/api/update_analytics', {
                email: userEmail,
                testScore: percentage
            }).catch(e => console.error("Failed to sync Test score to backend", e));
        }

        if (document.fullscreenElement) {
            document.exitFullscreen().catch(e => console.log(e));
        }

        setTestState('finished');
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const getScoreColor = (score) => {
        if (score >= 80) return '#10b981'; // Green
        if (score >= 60) return '#f59e0b'; // Yellow
        return '#ef4444'; // Red
    };

    const getBadgeClass = (score) => {
        if (score >= 80) return 'badge-excellent';
        if (score >= 60) return 'badge-good';
        return 'badge-needs-work';
    };

    const getBadgeText = (score) => {
        if (score >= 80) return 'Excellent Match';
        if (score >= 60) return 'Good Potential';
        return 'Needs Improvement';
    };

    // Render Test Component
    if (testState !== 'idle' && results) {
        if (testState === 'loading') {
            return (
                <div className="app-layout">
                    <nav className="navbar" style={{ padding: '0.75rem 2rem' }}>
                        <Link to="/applier" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}>H</div>
                            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Hire<span style={{ color: '#2563eb' }}>Me</span></span>
                        </Link>
                    </nav>
                    <main className="main-content" style={{ justifyContent: 'center' }}>
                        <div className="loading-state fade-in-up">
                            <div className="spinner"></div>
                            <div style={{ textAlign: 'center' }}>
                                <div className="loading-text">Generating Skill Assessment...</div>
                                <div className="loading-subtext mt-2">Curating 30 multiple-choice questions based on your profile's extracted terminology.</div>
                            </div>
                        </div>
                    </main>
                </div>
            );
        }

        if (testState === 'active') {
            const currentQ = questions[currentQIndex];
            return (
                <div className="app-layout">
                    {showWarningModal && (
                        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(15,23,42,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                            <div style={{ background: 'white', padding: '3rem', borderRadius: '16px', maxWidth: '500px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                                <div style={{ color: '#ef4444', marginBottom: '1rem' }}>
                                    <Layers size={48} style={{ margin: '0 auto' }} />
                                </div>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>Anti-Cheat Warning</h2>
                                <p style={{ color: '#334155', fontSize: '1.1rem', marginBottom: '0.5rem' }}>You navigated away or exited full screen.</p>
                                <p style={{ fontWeight: 700, color: '#ef4444', fontSize: '1.2rem', marginBottom: '2rem' }}>Warning {warnings} of 5</p>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>If you reach 5 warnings, the test will be automatically submitted.</p>
                                <button className="btn-primary" onClick={resumeTest} style={{ width: '100%', padding: '1rem', background: '#2563eb' }}>
                                    I understand, Return to Full Screen
                                </button>
                            </div>
                        </div>
                    )}
                    <nav className="navbar" style={{ padding: '0.75rem 2rem' }}>
                        <Link to="/applier" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}>H</div>
                            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Hire<span style={{ color: '#2563eb' }}>Me</span></span>
                        </Link>
                    </nav>
                    <main className="main-content">
                        <div className="test-container fade-in-up">
                            <div className="test-header">
                                <h2>Technical Skill Assessment</h2>
                                <div className={`timer ${timeLeft < 300 ? 'timer-warning' : ''}`}>
                                    <Clock size={18} /> {formatTime(timeLeft)}
                                </div>
                            </div>

                            <div className="test-progress">
                                <div className="progress-bar" style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}></div>
                            </div>
                            <p className="question-count">Question {currentQIndex + 1} of {questions.length}</p>

                            <div className="question-card">
                                <h3>{currentQ.question}</h3>
                                <div className="options-list">
                                    {currentQ.options.map((opt, i) => (
                                        <label key={i} className={`option-label ${answers[currentQ.id] === opt ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name={`q-${currentQ.id}`}
                                                value={opt}
                                                checked={answers[currentQ.id] === opt}
                                                onChange={() => handleAnswer(currentQ.id, opt)}
                                            />
                                            {opt}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="test-footer">
                                <button
                                    className="btn-secondary"
                                    onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                                    disabled={currentQIndex === 0}
                                >
                                    Previous
                                </button>
                                {currentQIndex < questions.length - 1 ? (
                                    <button className="btn-primary" onClick={() => setCurrentQIndex(prev => prev + 1)}>
                                        Next Question
                                    </button>
                                ) : (
                                    <button className="btn-primary" style={{ backgroundColor: '#10b981', color: 'white', borderColor: '#10b981' }} onClick={finishTest}>
                                        Submit Assessment
                                    </button>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            );
        }

        if (testState === 'finished') {
            return (
                <div className="app-layout">
                    <nav className="navbar" style={{ padding: '0.75rem 2rem' }}>
                        <Link to="/applier" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}>H</div>
                            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Hire<span style={{ color: '#2563eb' }}>Me</span></span>
                        </Link>
                    </nav>
                    <main className="main-content">
                        <div className="test-finished-container fade-in-up">
                            <h2>Assessment Complete</h2>

                            <div className="score-ring" style={{ background: `conic-gradient(${getScoreColor(testScore)} ${testScore}%, #e2e8f0 0)` }}>
                                <div className="score-inner">
                                    <span className="score-number">{testScore}%</span>
                                </div>
                            </div>

                            <div className={`badge ${getBadgeClass(testScore)}`} style={{ marginBottom: '2rem' }}>
                                {testScore >= 80 ? 'Highly Qualified' : testScore >= 60 ? 'Qualified Average' : 'Requires Training'}
                            </div>

                            <p className="upload-description" style={{ marginBottom: '2rem' }}>
                                You have finished your bespoke 30-question skill test based on the technical stack highlighted in your resume.
                            </p>
                            <button className="btn-secondary" onClick={() => setTestState('idle')}>
                                Return to ATS Profile
                            </button>
                        </div>
                    </main>
                </div>
            );
        }
    }

    // Normal App Render
    return (
        <div className="app-layout fade-in-up">
            <nav className="navbar" style={{ padding: '0.75rem 2rem', justifyContent: 'flex-start', gap: '2rem' }}>
                <Link to="/applier" className="btn-secondary" style={{ padding: '0.4rem 0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'center', textDecoration: 'none', color: '#1e293b' }}>
                    <ArrowLeft size={16} /> Dashboard
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}>H</div>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Hire<span style={{ color: '#2563eb' }}>Me</span></span>
                </div>
            </nav>

            <main className="main-content">
                {!loading && !results && (
                    <div className="hero-section">
                        <h1 className="hero-title">Optimize Your Resume for <span>ATS Systems</span></h1>
                        <p className="hero-subtitle">
                            Upload your PDF resume to instantly uncover how Applicant Tracking Systems evaluate your skills, then prove your worth with a tailored mock-test.
                        </p>
                    </div>
                )}

                {!loading && !results && (
                    <label
                        className={`upload-container ${isDragging ? 'dragging' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="upload-icon-wrapper">
                            <UploadCloud size={32} strokeWidth={2} />
                        </div>
                        <div className="upload-title">Drag & Drop your resume</div>
                        <div className="upload-description">Supported format: PDF up to 10MB</div>

                        <div style={{ marginTop: '1rem' }} className="btn-primary" onClick={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}>
                            Choose File
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".pdf"
                            style={{ display: 'none' }}
                        />
                        {error && <div style={{ color: '#ef4444', marginTop: '1rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}><AlertCircle size={18} /> {error}</div>}
                    </label>
                )}

                {loading && (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <div style={{ textAlign: 'center' }}>
                            <div className="loading-text">Analyzing Profile...</div>
                            <div className="loading-subtext mt-2">Parsing terminology and matching structural datasets</div>
                        </div>
                    </div>
                )}

                {results && !loading && testState === 'idle' && (
                    <div className="results-grid fade-in-up">
                        {/* Left Column: Score */}
                        <div className="card score-container" style={{ padding: '2rem' }}>
                            <div className="card-title" style={{ width: '100%', justifyContent: 'center', marginBottom: '2rem' }}>
                                <Activity size={20} className="text-slate-500" /> Overall ATS Score
                            </div>

                            <div
                                className="score-ring"
                                style={{
                                    background: `conic-gradient(${getScoreColor(results.score)} ${results.score}%, #e2e8f0 0)`
                                }}
                            >
                                <div className="score-inner">
                                    <span className="score-number">{results.score}</span>
                                    <span className="score-text">out of 100</span>
                                </div>
                            </div>

                            <div className={`badge ${getBadgeClass(results.score)}`}>
                                {getBadgeText(results.score)}
                            </div>

                            <div className="upload-description" style={{ marginBottom: '2rem', lineHeight: 1.6 }}>
                                {results.score >= 80 ? "Your resume passes the initial ATS screening filters with flying colors." :
                                    results.score >= 60 ? "Your resume is visible, but might be filtered out for highly competitive roles." :
                                        "Critical keywords missing. Your profile may be automatically rejected."}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', alignItems: 'center' }}>
                                {cooldownLeft !== null ? (
                                    <div style={{ width: '100%', textAlign: 'center', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '1rem' }}>
                                        <div style={{ fontWeight: 600, color: '#1e40af', marginBottom: '0.5rem' }}>Forced Mock Test Starts in:</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb', marginBottom: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                            <Clock size={24} /> {formatTime(cooldownLeft)}
                                        </div>
                                        <button className="btn-primary" style={{ width: '100%', padding: '0.6rem' }} onClick={() => { setCooldownLeft(null); startAssessment(); }}>
                                            Start Now (Skip Prep)
                                        </button>
                                    </div>
                                ) : (
                                    <button className="btn-primary" style={{ width: '100%' }} onClick={startAssessment}>
                                        <PlayCircle size={18} /> Start Technical Test
                                    </button>
                                )}
                                <button
                                    className="btn-secondary"
                                    style={{ width: '100%' }}
                                    onClick={() => { setResults(null); setFile(null); setCooldownLeft(null); }}
                                >
                                    <RefreshCw size={18} /> Analyze New Resume
                                </button>
                            </div>
                        </div>

                        {/* Right Column: Details */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                            <div className="card">
                                <div className="card-header">
                                    <h2 className="card-title"><Layers size={20} color="#2563eb" /> Extracted Core Skills</h2>
                                </div>
                                <div className="card-body">
                                    {results.skills && results.skills.length > 0 ? (
                                        <div className="skills-wrapper">
                                            {results.skills.map((skill, idx) => (
                                                <div key={idx} className="skill-badge">
                                                    <Tag size={14} /> {skill}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="upload-description">No specific technical terminology detected. Ensure your industry keywords are spelled out clearly.</p>
                                    )}
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-header">
                                    <h2 className="card-title"><FileText size={20} color="#059669" /> Evaluation Feedback</h2>
                                </div>
                                <div className="card-body">
                                    <div className="feedback-list">
                                        {results.feedback.map((item, idx) => {
                                            const isPositive = item.includes("Great") || item.includes("Strong") || item.includes("Found");
                                            return (
                                                <div key={idx} className="feedback-item">
                                                    {isPositive ? (
                                                        <CheckCircle className="feedback-icon-success" size={26} strokeWidth={2.5} />
                                                    ) : (
                                                        <AlertCircle className="feedback-icon-warning" size={26} strokeWidth={2.5} />
                                                    )}
                                                    <span className="feedback-text">{item}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default ResumeScanner;
