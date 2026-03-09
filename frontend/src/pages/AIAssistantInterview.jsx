import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, User, Bot, Play, Settings, ArrowLeft, Camera, AlertTriangle, Monitor, Volume2, Mic, MicOff, History, CheckCircle, Award, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function AIAssistantInterview() {
    const navigate = useNavigate();
    const [domain, setDomain] = useState('Full Stack Development');
    const [level, setLevel] = useState('Intermediate');
    const [isStarted, setIsStarted] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [history, setHistory] = useState([]);
    const [evaluation, setEvaluation] = useState(null);

    // Proctoring & Media States
    const [warnings, setWarnings] = useState(0);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [hasCameraError, setHasCameraError] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Your browser does not support Voice Input. Please use Google Chrome.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            const current = event.resultIndex;
            const transcript = event.results[current][0].transcript;
            setInput(transcript);
        };

        recognition.onerror = (event) => {
            console.error(event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const domains = [
        "Full Stack Development",
        "Frontend Development",
        "Backend Development",
        "Data Science",
        "Data Analytics",
        "Cloud Computing",
        "Cyber Security",
        "Mobile App Development",
        "Artificial Intelligence & Machine Learning"
    ];

    const levels = ["Beginner", "Intermediate", "Advanced"];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            fetchHistory(parsedUser.email);
        }
    }, []);

    const fetchHistory = async (email) => {
        try {
            const response = await axios.post('http://127.0.0.1:5000/api/user_history', { email });
            if (response.data.success) {
                setHistory(response.data.mockInterviews || []);
            }
        } catch (error) {
            console.error("Failed to fetch history");
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // TTS Functionality (Jarvis-like voice if possible)
    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Cancel any ongoing speech
            const utterance = new SpeechSynthesisUtterance(text);

            // Voice styling to sound more professional
            const voices = window.speechSynthesis.getVoices();
            const englishVoices = voices.filter(v => v.lang.startsWith('en'));
            const proVoice = englishVoices.find(v => v.name.includes('Google UK English Male')) ||
                englishVoices.find(v => v.name.includes('Microsoft Mark')) ||
                englishVoices.find(v => v.name.includes('Google US English Male')) ||
                englishVoices[0];

            if (proVoice) {
                utterance.voice = proVoice;
            }
            utterance.rate = 1.0;
            utterance.pitch = 0.9; // Slightly lower pitch for more authority/Jarvis feel

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            window.speechSynthesis.speak(utterance);
        }
    };

    // Camera & Anti-Tab Switch logic (Only runs when interview starts)
    useEffect(() => {
        let handleVisibilityChange;

        if (isStarted) {
            // 1. Setup Camera Access (Requesting high resolution for clear feed)
            navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, height: { ideal: 720 } }
            })
                .then(stream => {
                    streamRef.current = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                })
                .catch(err => {
                    console.error("Camera access denied or failed", err);
                    setHasCameraError(true);
                    alert("Camera access is mandated for proctored mock interviews. Please enable permissions.");
                });

            // 2. Setup Anti-Tab Switch monitoring (Alert disabled for smoother experience)
            handleVisibilityChange = () => {
                if (document.visibilityState === 'hidden') {
                    setWarnings(prev => prev + 1);
                }
            };

            document.addEventListener("visibilitychange", handleVisibilityChange);
            window.addEventListener("blur", handleVisibilityChange);
        }

        return () => {
            if (handleVisibilityChange) {
                document.removeEventListener("visibilitychange", handleVisibilityChange);
                window.removeEventListener("blur", handleVisibilityChange);
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            // Stop speech when unmounting
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, [isStarted]);


    const startInterview = async () => {
        setIsStarted(true);
        setIsLoading(true);
        try {
            const initialHistory = [];
            const response = await axios.post('http://127.0.0.1:5000/api/ai_mock_interview', {
                domain,
                level,
                history: initialHistory
            });

            if (response.data.success) {
                setMessages([{ role: 'model', content: response.data.reply }]);
                speakText(response.data.reply);
            } else {
                setMessages([{ role: 'model', content: "Error connecting to AI Assistant." }]);
            }
        } catch (error) {
            setMessages([{ role: 'model', content: "Failed to initialize interview. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        // Cancel speech if user interrupts
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        const userMessage = { role: 'user', content: input };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://127.0.0.1:5000/api/ai_mock_interview', {
                domain,
                level,
                history: updatedMessages
            });

            if (response.data.success) {
                setMessages(prev => [...prev, { role: 'model', content: response.data.reply }]);
                speakText(response.data.reply);
            } else {
                setMessages(prev => [...prev, { role: 'model', content: "Something went wrong. Please try again." }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', content: "Network error occurred connecting to central AI." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinishInterview = async () => {
        setIsLoading(true);
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        try {
            const response = await axios.post('http://127.0.0.1:5000/api/evaluate_mock_interview', {
                email: user?.email,
                domain,
                level,
                history: messages
            });

            if (response.data.success) {
                setEvaluation({
                    score: response.data.score,
                    feedback: response.data.feedback
                });
                if (user?.email) fetchHistory(user?.email);
            } else {
                alert("Evaluation error: " + response.data.error);
                navigate('/applier');
            }
        } catch (error) {
            alert("Error: You must answer at least one question to receive an evaluation.");
            navigate('/applier');
        } finally {
            setIsLoading(false);
        }
    };

    if (evaluation) {
        return (
            <div className="fade-in-up" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '2rem' }}>
                <div className="card" style={{ maxWidth: '650px', width: '100%', padding: '3rem 2.5rem', textAlign: 'center' }}>

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ background: evaluation.score >= 70 ? '#ecfdf5' : '#fff7ed', borderRadius: '50%', padding: '1.5rem' }}>
                            <Award size={56} color={evaluation.score >= 70 ? '#10b981' : '#f97316'} />
                        </div>
                    </div>

                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Interview Complete</h1>
                    <p style={{ color: '#64748b', marginBottom: '2.5rem', lineHeight: '1.5' }}>Here is your AI-generated dynamic evaluation based purely on your interactions and technical engineering accuracy.</p>

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 3rem', background: '#f1f5f9', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Final Score</span>
                            <span style={{ fontSize: '4.5rem', fontWeight: 800, color: evaluation.score >= 70 ? '#10b981' : '#f97316', lineHeight: 1 }}>{evaluation.score}</span>
                            <span style={{ fontSize: '1rem', color: '#64748b', marginTop: '0.5rem', fontWeight: 600 }}>out of 100</span>
                        </div>
                    </div>

                    <div style={{ textAlign: 'left', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '2.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.75rem 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Target size={18} color="#3b82f6" /> Professional Feedback
                        </h3>
                        <p style={{ color: '#334155', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                            {evaluation.feedback}
                        </p>
                    </div>

                    <button className="btn-primary" onClick={() => { setEvaluation(null); setIsStarted(false); setMessages([]); }} style={{ padding: '0.85rem 2.5rem', fontSize: '1.05rem', fontWeight: 600 }}>
                        Return to Setup
                    </button>
                </div>
            </div>
        );
    }

    if (!isStarted) {
        return (
            <div className="app-layout fade-in-up" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '2rem' }}>
                <div className="card" style={{ maxWidth: '550px', width: '100%', padding: '3rem 2.5rem', textAlign: 'center' }}>

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ background: '#ecfdf5', borderRadius: '50%', padding: '1.25rem' }}>
                            <Bot size={44} color="#10b981" />
                        </div>
                    </div>

                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Proctored AI Mock Interview</h1>
                    <p style={{ color: '#64748b', marginBottom: '2.5rem', lineHeight: '1.5' }}>
                        Experience a rigorous technical interview simulated by an advanced AI matrix.
                        <strong> Webcam access and tab-locking protocols will be activated to ensure a professional environment.</strong> Let's prepare you for the real deal.
                    </p>

                    <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                        <label className="modal-label">Select Domain Matrix</label>
                        <select className="modal-input" value={domain} onChange={(e) => setDomain(e.target.value)} style={{ cursor: 'pointer' }}>
                            {domains.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    <div style={{ textAlign: 'left', marginBottom: '2.5rem' }}>
                        <label className="modal-label">Select Rigor Level</label>
                        <select className="modal-input" value={level} onChange={(e) => setLevel(e.target.value)} style={{ cursor: 'pointer' }}>
                            {levels.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', background: '#fef2f2', padding: '1rem', borderRadius: '12px', border: '1px solid #fee2e2', marginBottom: '2rem', textAlign: 'left' }}>
                        <AlertTriangle size={24} color="#ef4444" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '0.85rem', color: '#b91c1c', display: 'block', lineHeight: '1.4' }}>By clicking Start, you authorize webcam capture. Switching tabs during the interview will trigger a warning protocol. Audio guidance will initialize.</span>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button className="btn-secondary" onClick={() => navigate('/applier')} style={{ flex: 1 }}>
                            Retreat to Dashboard
                        </button>
                        <button className="btn-primary" onClick={startInterview} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#10b981' }}>
                            <Play size={18} /> Enable Protocols & Start
                        </button>
                    </div>

                    {/* Interview History Section */}
                    {history.length > 0 && (
                        <div style={{ marginTop: '3rem', textAlign: 'left', borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                                <History size={20} color="#3b82f6" />
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Your Assessment History</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                                {history.map((record, idx) => (
                                    <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                            <div>
                                                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>{record.domain}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{record.level} Level &bull; {new Date(record.date).toLocaleDateString()}</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: record.score >= 70 ? '#ecfdf5' : '#fff7ed', padding: '0.4rem 0.75rem', borderRadius: '8px', color: record.score >= 70 ? '#059669' : '#ea580c', fontWeight: 800, fontSize: '1.1rem' }}>
                                                {record.score}
                                            </div>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: '1.5' }}>{record.feedback}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f1f5f9' }}>
            <nav className="navbar" style={{ padding: '1rem 2rem', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', background: 'white', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => { if (window.confirm("Abort the active mock session? Progress will not be saved.")) navigate('/applier'); }} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'center', textDecoration: 'none', color: '#1e293b' }}>
                        <ArrowLeft size={16} /> Abort Session
                    </button>
                    <button onClick={() => { if (window.confirm("Are you ready to finish and submit for evaluation?")) handleFinishInterview(); }} style={{ padding: '0.4rem 0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'center', textDecoration: 'none', color: 'white', background: '#3b82f6', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                        <CheckCircle size={16} /> Finish Interview
                    </button>
                    <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#0f172a', marginLeft: '1rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bot size={20} strokeWidth={2.5} />
                        </div>
                        Central AI Proctored Network
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569', border: '1px solid #e2e8f0' }}>
                    <Settings size={14} color="#2563eb" /> {domain} &bull; {level}
                </div>
            </nav>

            <main style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', justifyContent: 'center' }}>
                <div style={{ maxWidth: '1200px', width: '100%', display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>

                    {/* Left Panel: Proctor Stream & Diagnostics */}
                    <div style={{ flexShrink: 0, width: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '0' }}>

                        {/* Video Element Block */}
                        <div style={{ background: '#fff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Camera size={16} color="#2563eb" /> Active Monitor
                                </span>
                                {warnings > 0 && (
                                    <span className="badge badge-needs-work" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', fontWeight: 700, background: '#fef2f2', color: '#b91c1c' }}>
                                        {warnings} Warning(s)
                                    </span>
                                )}
                            </div>

                            <div style={{ width: '100%', height: '280px', backgroundColor: '#0f172a', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: hasCameraError ? '2px solid #ef4444' : '2px solid transparent' }}>
                                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}></video>

                                {!hasCameraError && (
                                    <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '12px', color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }}></div>
                                        LIVE
                                    </div>
                                )}

                                {hasCameraError && (
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.8rem', textAlign: 'center', padding: '1rem' }}>
                                        <AlertTriangle size={24} color="#ef4444" style={{ marginBottom: '0.5rem' }} />
                                        Camera restricted. Allow permissions.
                                    </div>
                                )}
                            </div>

                            {/* JARVIS Audio visualizer placeholder */}
                            {isSpeaking ? (
                                <div className="fade-in-up" style={{ marginTop: '1rem', padding: '0.75rem', background: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid #bfdbfe' }}>
                                    <div style={{ display: 'flex', gap: '3px', alignItems: 'center', height: '15px' }}>
                                        <span style={{ width: '3px', height: '100%', background: '#2563eb', animation: 'bounce 1.2s infinite ease-in-out' }}></span>
                                        <span style={{ width: '3px', height: '100%', background: '#2563eb', animation: 'bounce 1.2s infinite ease-in-out', animationDelay: '0.1s' }}></span>
                                        <span style={{ width: '3px', height: '100%', background: '#2563eb', animation: 'bounce 1.2s infinite ease-in-out', animationDelay: '0.2s' }}></span>
                                        <span style={{ width: '3px', height: '100%', background: '#2563eb', animation: 'bounce 1.2s infinite ease-in-out', animationDelay: '0.3s' }}></span>
                                    </div>
                                    <span style={{ fontSize: '0.85rem', color: '#1d4ed8', fontWeight: 700, letterSpacing: '0.5px' }}>AI IS SPEAKING...</span>
                                    <Volume2 size={16} color="#1d4ed8" style={{ marginLeft: 'auto' }} />
                                </div>
                            ) : (
                                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid #e2e8f0' }}>
                                    <Mic size={16} color="#64748b" />
                                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Audio channel standing by.</span>
                                </div>
                            )}
                        </div>

                        <div style={{ background: '#fff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Monitor size={16} color="#8b5cf6" /> Strict Guidelines
                            </h3>
                            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#475569', fontSize: '0.85rem', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <li><strong style={{ color: '#0f172a' }}>No switching tabs:</strong> System logs violations.</li>
                                <li><strong style={{ color: '#0f172a' }}>Visibility:</strong> Keep your webcam feed clear at all times.</li>
                                <li><strong style={{ color: '#0f172a' }}>Input:</strong> Manually type your technical engineering responses below.</li>
                                <li><strong style={{ color: '#0f172a' }}>Jarvis Engine:</strong> Respond accurately to the vocalized AI's questions.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Panel: Chat Interface */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
                        {messages.map((msg, index) => (
                            <div key={index} className="fade-in-up" style={{
                                display: 'flex',
                                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                                gap: '1rem',
                                alignItems: 'flex-start'
                            }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: msg.role === 'user' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#f0fdf4',
                                    color: msg.role === 'user' ? '#fff' : '#10b981',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                    {msg.role === 'user' ? <User size={20} /> : <Bot size={22} />}
                                </div>

                                <div style={{
                                    background: msg.role === 'user' ? '#2563eb' : '#fff',
                                    color: msg.role === 'user' ? '#fff' : '#334155',
                                    padding: '1.5rem', borderRadius: '1.25rem',
                                    borderTopRightRadius: msg.role === 'user' ? '4px' : '1.25rem',
                                    borderTopLeftRadius: msg.role === 'model' ? '4px' : '1.25rem',
                                    maxWidth: '90%',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.03)',
                                    border: msg.role === 'model' ? '1px solid #e2e8f0' : 'none',
                                    fontSize: '1.05rem', lineHeight: 1.6,
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="fade-in-up" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0fdf4', color: '#10b981', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}><Bot size={22} /></div>
                                <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '1.25rem', borderTopLeftRadius: '4px', border: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.03)' }}>
                                    <span className="dot-typing" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#94a3b8', animation: 'bounce 1.4s infinite ease-in-out both' }}></span>
                                    <span className="dot-typing" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#94a3b8', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }}></span>
                                    <span className="dot-typing" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#94a3b8', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }}></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                </div>
            </main>

            <footer style={{ background: '#fff', padding: '1.5rem 2rem', borderTop: '1px solid #e2e8f0', flexShrink: 0, display: 'flex', justifyContent: 'center', boxShadow: '0 -4px 10px rgba(0,0,0,0.02)', position: 'sticky', bottom: 0, zIndex: 10 }}>
                <form onSubmit={handleSendMessage} style={{ maxWidth: '800px', width: '100%', display: 'flex', gap: '1rem', position: 'relative', alignItems: 'center' }}>
                    <button
                        type="button"
                        onClick={startListening}
                        disabled={isLoading}
                        style={{
                            width: '56px', height: '56px', borderRadius: '50%', border: 'none', background: isListening ? '#ef4444' : '#f1f5f9', color: isListening ? 'white' : '#64748b',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: isListening ? '0 0 15px rgba(239, 68, 68, 0.4)' : 'none', flexShrink: 0
                        }}
                        title="Voice Input"
                    >
                        {isListening ? <MicOff size={24} className="pulse-animation" /> : <Mic size={24} />}
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your engineering response manually here..."
                        disabled={isLoading}
                        style={{
                            flex: 1, padding: '1.25rem 1.5rem', borderRadius: '1rem', border: '1px solid #cbd5e1',
                            outline: 'none', fontSize: '1.05rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                            background: isLoading ? '#f8fafc' : '#fff', transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => { e.target.style.borderColor = '#2563eb'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; }}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        style={{
                            minWidth: '120px', borderRadius: '1rem', background: (!input.trim() || isLoading) ? '#cbd5e1' : '#2563eb',
                            color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: (!input.trim() || isLoading) ? 'not-allowed' : 'pointer', transition: 'all 0.2s', fontWeight: 700, fontSize: '1.05rem'
                        }}
                    >
                        Submit <Send size={20} />
                    </button>
                </form>
            </footer>
        </div>
    );
}

export default AIAssistantInterview;
