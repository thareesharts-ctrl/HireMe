import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Award, Clock, ArrowLeft, Layers, PlayCircle } from 'lucide-react';

function ModelMockTest() {
    const [selectedDomain, setSelectedDomain] = useState('');
    const [testState, setTestState] = useState('idle'); // idle, loading, active, finished
    const [questions, setQuestions] = useState([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 mins in seconds
    const [testScore, setTestScore] = useState(0);
    const [warnings, setWarnings] = useState(0);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const navigate = useNavigate();

    // Get current user email for scoped analytics
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = currentUser.email || 'guest';
    const analyticsKey = `userAnalytics_${userEmail}`;

    const domains = [
        'Full Stack Development (MERN)',
        'Data Science & Analytics',
        'Cyber Security',
        'Cloud Computing (AWS/GCP)',
        'Mobile App Development',
        'Artificial Intelligence & ML'
    ];

    // Timer Effect
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

    const startAssessment = async () => {
        if (!selectedDomain) return;

        try {
            await document.documentElement.requestFullscreen();
        } catch (e) {
            alert("Please enable full screen to take the assessment.");
            return;
        }

        setTestState('loading');
        setWarnings(0);
        try {
            const response = await axios.post('http://127.0.0.1:5000/api/generate-test', {
                skills: [selectedDomain, 'Core concepts', 'Best Practices', 'Modern Architecture']
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
            alert("Failed to generate the mock test. Ensure the backend is running.");
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
            mockScore: percentage,
            mockDomain: selectedDomain,
            lastMockDate: new Date().toISOString()
        };
        localStorage.setItem(analyticsKey, JSON.stringify(newData));

        // Push test score to Backend
        if (userEmail !== 'guest') {
            axios.post('http://127.0.0.1:5000/api/update_analytics', {
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

    const Navbar = () => (
        <nav className="navbar" style={{ padding: '0.75rem 2rem', justifyContent: 'flex-start', gap: '2rem' }}>
            <Link to="/applier" className="btn-secondary" style={{ padding: '0.4rem 0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'center', textDecoration: 'none', color: '#1e293b' }}>
                <ArrowLeft size={16} /> Dashboard
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}>H</div>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Hire<span style={{ color: '#2563eb' }}>Me</span></span>
            </div>
        </nav>
    );

    if (testState === 'loading') {
        return (
            <div className="app-layout">
                <Navbar />
                <main className="main-content" style={{ justifyContent: 'center' }}>
                    <div className="loading-state fade-in-up">
                        <div className="spinner"></div>
                        <div style={{ textAlign: 'center' }}>
                            <div className="loading-text">Generating Mock Assessment...</div>
                            <div className="loading-subtext mt-2">Curating 30 multiple-choice questions for {selectedDomain}.</div>
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
                <Navbar />
                <main className="main-content">
                    <div className="test-container fade-in-up">
                        <div className="test-header">
                            <h2>{selectedDomain} Assessment</h2>
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
                                    Submit Mock Test
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
                <Navbar />
                <main className="main-content">
                    <div className="test-finished-container fade-in-up">
                        <h2>Mock Complete</h2>
                        <div className="score-ring" style={{ background: `conic-gradient(${getScoreColor(testScore)} ${testScore}%, #e2e8f0 0)` }}>
                            <div className="score-inner">
                                <span className="score-number">{testScore}%</span>
                            </div>
                        </div>
                        <p className="upload-description" style={{ marginBottom: '2rem' }}>
                            You have successfully completed the mock evaluation for {selectedDomain}.
                        </p>
                        <button className="btn-primary" onClick={() => navigate('/applier')}>
                            View Real Analytics Dashboard
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="app-layout fade-in-up">
            <Navbar />
            <main className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '4rem' }}>
                <div style={{ background: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', width: '100%', maxWidth: '600px', border: '1px solid #e2e8f0' }}>

                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ background: '#eff6ff', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#2563eb' }}>
                            <Layers size={32} />
                        </div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Model Mock Assessment</h1>
                        <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
                            Select your specialized domain below to generate an instant 30-question technical quiz and evaluate your readiness anytime.
                        </p>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Select Professional Domain</label>
                        <select
                            value={selectedDomain}
                            onChange={(e) => setSelectedDomain(e.target.value)}
                            style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '2px solid #cbd5e1', fontSize: '1rem', outline: 'none', transition: 'border 0.2s', cursor: 'pointer' }}
                        >
                            <option value="" disabled>-- Choose a Tech Stack --</option>
                            {domains.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        className="btn-primary"
                        disabled={!selectedDomain}
                        onClick={startAssessment}
                        style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', opacity: !selectedDomain ? 0.6 : 1 }}
                    >
                        <PlayCircle size={20} /> Generate & Start Test
                    </button>

                </div>
            </main>
        </div>
    );
}

export default ModelMockTest;
