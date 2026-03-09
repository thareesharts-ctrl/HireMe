import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Clock, CheckCircle, AlertTriangle, ArrowRight, Activity, Code, Target, BookOpen, Loader2 } from 'lucide-react';
import '../App.css';

function JobAssessment() {
    const [user, setUser] = useState(null);
    const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes in seconds
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [finalScore, setFinalScore] = useState(0);
    const [detailedScores, setDetailedScores] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [dsaCode, setDsaCode] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const { jobId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        } else {
            navigate('/login');
            return;
        }

        const initializeTest = async () => {
            try {
                // 1. Fetch Job Role
                const jobsRes = await axios.get('http://127.0.0.1:5000/api/jobs');
                const job = jobsRes.data.jobs.find(j => j._id === jobId);
                const role = job ? job.role : 'General Software Engineering';

                // Get preferred language from Profile Skill
                const parsedUser = JSON.parse(localStorage.getItem('user') || '{}');
                const userProfileStorageKey = `userProfileData_${parsedUser.email}`;
                const profileData = JSON.parse(localStorage.getItem(userProfileStorageKey) || '{}');
                const userLanguage = profileData.skill || 'Python';

                // 2. Generate Dynamic Test using Gemini
                const testRes = await axios.post('http://127.0.0.1:5000/api/generate-test', {
                    skills: [role, 'Aptitude', 'Logical Reasoning', userLanguage],
                    language: userLanguage
                });

                if (testRes.data.success && testRes.data.assessment) {
                    const data = testRes.data.assessment;
                    // Restructure to flat array
                    const flatQs = [
                        ...(data.aptitude || []).map(q => ({ ...q, section: 'Aptitude' })),
                        ...(data.technical || []).map(q => ({ ...q, section: 'Technical' })),
                        { ...(data.dsa || {}), section: 'DSA', isDsa: true }
                    ];
                    setQuestions(flatQs);
                    setDsaCode(data.dsa?.starterCode || "");
                } else {
                    throw new Error("Failed to load questions");
                }
            } catch (err) {
                console.error("Test Init Error:", err);
                alert("Failed to load assessment. Returning to dashboard.");
                navigate('/applier');
            } finally {
                setIsLoading(false);
            }
        };

        initializeTest();

        // Timer Logic
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(); // Auto-submit when time is up
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate, jobId]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleOptionSelect = (qId, option) => {
        setAnswers(prev => ({ ...prev, [qId]: option }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Calculate Score
        let aptitudeCorrect = 0;
        let technicalCorrect = 0;

        questions.forEach(q => {
            if (!q.isDsa && answers[q.id] === q.correctAnswer) {
                if (q.section === 'Aptitude') aptitudeCorrect++;
                if (q.section === 'Technical') technicalCorrect++;
            }
        });

        const aptitudeCount = questions.filter(q => q.section === 'Aptitude').length || 20;
        const technicalCount = questions.filter(q => q.section === 'Technical').length || 20;

        const aptitudeScore = Math.round((aptitudeCorrect / aptitudeCount) * 20);
        const technicalScore = Math.round((technicalCorrect / technicalCount) * 20);

        try {
            const parsedUser = JSON.parse(localStorage.getItem('user'));
            const dsaQ = questions.find(q => q.isDsa);

            // Push score to backend to evaluate DSA
            const response = await axios.post('http://127.0.0.1:5000/api/submit_assessment', {
                email: parsedUser.email,
                jobId: jobId,
                aptitudeScore: aptitudeScore,
                technicalScore: technicalScore,
                dsaCode: dsaCode,
                dsaQuestion: dsaQ ? dsaQ.question : '',
                language: dsaQ ? dsaQ.language : 'Python'
            });

            if (response.data.success) {
                const finalPercentage = response.data.scores.testScore;
                setFinalScore(finalPercentage);
                setDetailedScores(response.data.scores);

                // Update local analytics to show in their dashboard
                const userAnalyticsKey = `userAnalytics_${parsedUser.email}`;
                let analytics = JSON.parse(localStorage.getItem(userAnalyticsKey) || '{}');
                analytics.mockScore = finalPercentage;
                analytics.aptitudeScore = aptitudeScore;
                analytics.technicalScore = technicalScore;
                analytics.dsaScore = response.data.scores.dsaScore;
                localStorage.setItem(userAnalyticsKey, JSON.stringify(analytics));
            }

        } catch (error) {
            console.error('Failed to submit score:', error);
            alert("Failed to sync score online. Please check connection.");
        }
        setIsSubmitting(false);
        setIsSubmitted(true);
    };

    if (!user) return null;

    if (isSubmitting) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
                <Loader2 className="animate-spin text-blue-600 mb-6" size={64} />
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Evaluating Assessment...</h2>
                <p style={{ color: '#475569', marginTop: '0.5rem', fontWeight: 500, maxWidth: '400px', textAlign: 'center' }}>Our AI models are dynamically analyzing your code. Hold tight.</p>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
                <div style={{ background: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '600px', width: '100%' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                        <CheckCircle size={40} color="#10b981" />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Assessment Completed</h1>
                    <p style={{ color: '#64748b', marginBottom: '2rem' }}>Your Technical, Aptitude, and DSA performance has been recorded securely.</p>

                    <div className="score-ring" style={{ background: `conic-gradient(${finalScore >= 80 ? '#10b981' : finalScore >= 60 ? '#f59e0b' : '#ef4444'} ${finalScore}%, #e2e8f0 0)`, margin: '0 auto 2rem auto', transform: 'scale(1.2)' }}>
                        <div className="score-inner">
                            <span className="score-number" style={{ fontSize: '2rem' }}>{finalScore}%</span>
                        </div>
                    </div>

                    {detailedScores && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginBottom: '2rem' }}>
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}>Aptitude</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{detailedScores.aptitudeScore} <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>/ 20</span></div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}>Technical</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{detailedScores.technicalScore} <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>/ 20</span></div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}>DSA Code</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{detailedScores.dsaScore} <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>/ 10</span></div>
                            </div>
                        </div>
                    )}

                    <button className="btn-primary" onClick={() => navigate('/applier')} style={{ width: '100%', padding: '0.75rem', fontSize: '1.05rem' }}>
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
                <Loader2 className="animate-spin text-blue-600 mb-6" size={64} />
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Generating Custom Assessment</h2>
                <p style={{ color: '#475569', marginTop: '0.5rem', fontWeight: 500, maxWidth: '400px', textAlign: 'center' }}>Connecting to AI Network to build optimistic and adaptive questions tailored specifically for this Role...</p>
            </div>
        );
    }

    if (!questions || questions.length === 0) return null;

    const currentQ = questions[currentQuestionIndex];
    const isAptitude = currentQ?.section === 'Aptitude';
    const isDsa = currentQ?.isDsa;
    const answeredCount = Object.keys(answers).length + (dsaCode.trim() !== '' ? 1 : 0);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' }}>

            {/* Top Navigation Bar / Status */}
            <nav style={{ padding: '1rem 2rem', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: isAptitude ? '#eff6ff' : (isDsa ? '#fff7ed' : '#f5f3ff'), padding: '0.5rem', borderRadius: '8px' }}>
                        {isAptitude ? <Activity size={20} color="#3b82f6" /> : (isDsa ? <Code size={20} color="#ea580c" /> : <Code size={20} color="#8b5cf6" />)}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>{currentQ?.section === 'Aptitude' ? 'Aptitude & Logic Reasoning' : (currentQ?.section === 'Technical' ? 'Technical Assessment' : 'DSA Coding Challenge')}</h2>
                        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Question {currentQuestionIndex + 1} of {questions.length}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef2f2', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                        <Clock size={16} color={timeLeft < 600 ? "#ef4444" : "#475569"} />
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: timeLeft < 600 ? "#ef4444" : "#0f172a", fontVariantNumeric: 'tabular-nums' }}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                    <button className="btn-primary" onClick={() => { if (window.confirm("Are you sure you want to finish the test early?")) handleSubmit(); }} style={{ background: '#10b981' }}>
                        Submit Test
                    </button>
                </div>
            </nav>

            <main style={{ flex: 1, padding: '3rem 2rem', maxWidth: '800px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>

                {/* Progress Bar Container */}
                <div style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>
                        <span>Progress</span>
                        <span>{Math.round((answeredCount / questions.length) * 100)}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: '#2563eb', width: `${(answeredCount / questions.length) * 100}%`, transition: 'width 0.3s ease' }}></div>
                    </div>
                </div>

                {/* Question Box */}
                <div className="fade-in-up" key={currentQuestionIndex} style={{ background: 'white', padding: '2.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {isDsa ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', flex: 1 }}>
                            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', color: '#0f172a', fontWeight: 600, lineHeight: 1.5 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Coding Problem</span>
                                    <span style={{ background: '#1e293b', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700 }}>{currentQ.language}</span>
                                </div>
                                {currentQ.question}
                            </div>
                            <textarea
                                value={dsaCode}
                                onChange={e => setDsaCode(e.target.value)}
                                style={{
                                    flex: 1, minHeight: '300px', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1',
                                    fontFamily: 'monospace', fontSize: '0.95rem', outline: 'none', background: '#1e293b', color: '#f8fafc',
                                    resize: 'vertical'
                                }}
                                spellCheck="false"
                                placeholder="// Write your code here..."
                            ></textarea>
                        </div>
                    ) : (
                        <>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', marginBottom: '2rem', lineHeight: 1.5 }}>
                                {currentQ.question}
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {currentQ.options?.map((opt, i) => {
                                    const isSelected = answers[currentQ.id] === opt;
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => handleOptionSelect(currentQ.id, opt)}
                                            style={{
                                                width: '100%', textAlign: 'left', padding: '1rem 1.25rem', fontSize: '1rem',
                                                background: isSelected ? '#eff6ff' : 'white',
                                                border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                                                borderRadius: '8px', cursor: 'pointer', color: isSelected ? '#1e3a8a' : '#334155',
                                                fontWeight: isSelected ? 600 : 500, transition: 'all 0.2s',
                                                display: 'flex', alignItems: 'center', gap: '1rem'
                                            }}
                                        >
                                            <div style={{
                                                width: '24px', height: '24px', borderRadius: '50%', border: isSelected ? '6px solid #2563eb' : '2px solid #cbd5e1',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}></div>
                                            {opt}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* Bottom Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
                    <button
                        onClick={handlePrev}
                        disabled={currentQuestionIndex === 0}
                        style={{ padding: '0.75rem 1.5rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, color: '#475569', cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer', opacity: currentQuestionIndex === 0 ? 0.5 : 1 }}
                    >
                        Previous
                    </button>

                    {currentQuestionIndex === questions.length - 1 ? (
                        <button className="btn-primary" onClick={handleSubmit} style={{ padding: '0.75rem 2rem', display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#10b981' }}>
                            Submit Assessment <CheckCircle size={18} />
                        </button>
                    ) : (
                        <button className="btn-primary" onClick={handleNext} style={{ padding: '0.75rem 2rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            Next Question <ArrowRight size={18} />
                        </button>
                    )}
                </div>

            </main>
        </div>
    );
}

export default JobAssessment;
