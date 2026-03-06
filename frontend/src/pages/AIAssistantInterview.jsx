import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, User, Bot, Play, Settings, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';

function AIAssistantInterview() {
    const navigate = useNavigate();
    const [domain, setDomain] = useState('Full Stack Development');
    const [level, setLevel] = useState('Intermediate');
    const [isStarted, setIsStarted] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

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
        scrollToBottom();
    }, [messages]);

    const startInterview = async () => {
        setIsStarted(true);
        setIsLoading(true);
        try {
            const initialHistory = [];
            const response = await axios.post('http://localhost:5000/api/ai_mock_interview', {
                domain,
                level,
                history: initialHistory
            });

            if (response.data.success) {
                setMessages([{ role: 'model', content: response.data.reply }]);
            } else {
                setMessages([{ role: 'model', content: "Error connecting to interview server." }]);
            }
        } catch (error) {
            setMessages([{ role: 'model', content: "Failed to fetch response. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/ai_mock_interview', {
                domain,
                level,
                history: updatedMessages
            });

            if (response.data.success) {
                setMessages(prev => [...prev, { role: 'model', content: response.data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'model', content: "Something went wrong. Please try again." }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', content: "Network error occurred. The server might be rate-limited." }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isStarted) {
        return (
            <div className="app-layout fade-in-up" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '2rem' }}>
                <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '3rem 2rem', textAlign: 'center' }}>

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ background: '#eff6ff', borderRadius: '50%', padding: '1rem' }}>
                            <Bot size={40} color="#3b82f6" />
                        </div>
                    </div>

                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Automated Mock Interview</h1>
                    <p style={{ color: '#64748b', marginBottom: '2.5rem' }}>Practice your technical skills with our intelligent AI interviewer. Select your domain and desired difficulty level below.</p>

                    <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                        <label className="modal-label">Select Domain</label>
                        <select className="modal-input" value={domain} onChange={(e) => setDomain(e.target.value)} style={{ cursor: 'pointer' }}>
                            {domains.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    <div style={{ textAlign: 'left', marginBottom: '2.5rem' }}>
                        <label className="modal-label">Select Difficulty Level</label>
                        <select className="modal-input" value={level} onChange={(e) => setLevel(e.target.value)} style={{ cursor: 'pointer' }}>
                            {levels.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button className="btn-secondary" onClick={() => navigate('/applier')}>
                            Cancel
                        </button>
                        <button className="btn-primary" onClick={startInterview} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Play size={18} /> Start Interview
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f1f5f9' }}>
            <nav className="navbar" style={{ padding: '1rem 2rem', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate('/applier')} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'center', textDecoration: 'none', color: '#1e293b' }}>
                        <ArrowLeft size={16} /> Dashboard
                    </button>
                    <div className="nav-brand">
                        <div className="nav-brand-icon"><Bot size={22} strokeWidth={2.5} /></div>
                        AI Mock Interviewer
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#e2e8f0', padding: '0.4rem 1rem', borderRadius: '2rem', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>
                    <Settings size={14} /> {domain} | {level}
                </div>
            </nav>

            <main style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ maxWidth: '800px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {messages.map((msg, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                            gap: '1rem',
                            alignItems: 'flex-start'
                        }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: msg.role === 'user' ? '#3b82f6' : '#eff6ff',
                                color: msg.role === 'user' ? '#fff' : '#3b82f6'
                            }}>
                                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                            </div>

                            <div style={{
                                background: msg.role === 'user' ? '#3b82f6' : '#fff',
                                color: msg.role === 'user' ? '#fff' : '#334155',
                                padding: '1.25rem', borderRadius: '1rem',
                                borderTopRightRadius: msg.role === 'user' ? '4px' : '1rem',
                                borderTopLeftRadius: msg.role === 'model' ? '4px' : '1rem',
                                maxWidth: '85%',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                border: msg.role === 'model' ? '1px solid #e2e8f0' : 'none',
                                fontSize: '1rem', lineHeight: 1.6,
                                whiteSpace: 'pre-wrap'
                            }}>
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eff6ff', color: '#3b82f6' }}><Bot size={18} /></div>
                            <div style={{ background: '#fff', padding: '1rem', borderRadius: '1rem', borderTopLeftRadius: '4px', border: '1px solid #e2e8f0', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                <span className="dot-typing" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8', animation: 'bounce 1.4s infinite ease-in-out both' }}></span>
                                <span className="dot-typing" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }}></span>
                                <span className="dot-typing" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }}></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            <footer style={{ background: '#fff', padding: '1.5rem', borderTop: '1px solid #e2e8f0', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                <form onSubmit={handleSendMessage} style={{ maxWidth: '800px', width: '100%', display: 'flex', gap: '1rem' }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your answer here..."
                        disabled={isLoading}
                        style={{
                            flex: 1, padding: '1rem 1.5rem', borderRadius: '3rem', border: '1px solid #cbd5e1',
                            outline: 'none', fontSize: '1rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        style={{
                            width: '52px', height: '52px', borderRadius: '50%', background: (!input.trim() || isLoading) ? '#cbd5e1' : '#3b82f6',
                            color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: (!input.trim() || isLoading) ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        <Send size={20} style={{ marginLeft: '2px' }} />
                    </button>
                </form>
            </footer>
        </div>
    );
}

export default AIAssistantInterview;
