import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Award, Mail, Lock, User, Briefcase, ChevronRight, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import '../App.css';

function Login() {
    const [searchParams] = useSearchParams();
    const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'register');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setIsLogin(searchParams.get('mode') !== 'register');
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (isLogin) {
                const res = await axios.post('http://127.0.0.1:5000/api/login', { email, password });
                if (res.data.success) {
                    localStorage.setItem('user', JSON.stringify(res.data.user));
                    navigate(res.data.user.role === 'admin' ? '/recruiter' : '/applier');
                }
            } else {
                const res = await axios.post('http://127.0.0.1:5000/api/register', { name, email, password, role });
                if (res.data.success) {
                    const loginRes = await axios.post('http://127.0.0.1:5000/api/login', { email, password });
                    if (loginRes.data.success) {
                        localStorage.setItem('user', JSON.stringify(loginRes.data.user));
                        navigate(loginRes.data.user.role === 'admin' ? '/recruiter' : '/applier');
                    }
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Connection error. Ensure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif',
            background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 60%, #f0fdf4 100%)'
        }}>
            {/* Left Panel */}
            <div style={{
                width: '420px', flexShrink: 0, background: 'linear-gradient(160deg, #1e3a8a 0%, #2563eb 100%)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center',
                padding: '3rem 2.5rem 0', color: 'white', overflow: 'hidden'
            }} className="login-panel-left">
                <div style={{ textAlign: 'center', width: '100%' }}>
                    <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '16px', padding: '1rem', display: 'inline-flex', marginBottom: '1.5rem' }}>
                        <Award size={40} color="white" />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.85rem', lineHeight: 1.2 }}>
                        AI-Powered Resume Intelligence
                    </h2>
                    <p style={{ color: '#bfdbfe', fontSize: '0.925rem', lineHeight: 1.7, marginBottom: '1.75rem' }}>
                        Get your ATS score, discover missing skills, and take personalized technical assessments — all in one place.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', textAlign: 'left' }}>
                        {['Instant ATS Score from PDF Resume', 'AI-generated 30-question skill tests', 'Recruiter candidate pipeline manager', 'Gemini AI career assistant 24/7'].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.875rem', color: '#dbeafe' }}>
                                <div style={{ width: '18px', height: '18px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <ChevronRight size={10} color="white" />
                                </div>
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
                {/* Man with Resume Illustration */}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                    <img
                        src="/resume-man.png"
                        alt="Professional with resume"
                        style={{
                            width: '85%', maxWidth: '300px',
                            filter: 'drop-shadow(0 -8px 24px rgba(0,0,0,0.25))',
                            objectFit: 'contain'
                        }}
                    />
                </div>
            </div>

            {/* Right Panel: Form */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem 2rem', background: '#ffffff', overflowY: 'auto' }}>
                <div style={{ width: '100%', maxWidth: '420px' }}>
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '2rem' }}>
                        <ArrowLeft size={16} /> Back to Home
                    </Link>

                    <div style={{ marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                            {isLogin ? 'Welcome back!' : 'Create your account'}
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                            {isLogin ? 'Sign in to access your dashboard.' : 'Join thousands of candidates and recruiters.'}
                        </p>
                    </div>

                    {error && (
                        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.8rem 1rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.5rem', border: '1px solid #fecaca' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>

                        {!isLogin && (
                            <div>
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.4rem' }}>Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={16} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '0.85rem', transform: 'translateY(-50%)' }} />
                                    <input type="text" required placeholder="John Doe" value={name} onChange={e => setName(e.target.value)}
                                        style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                                </div>
                            </div>
                        )}

                        <div>
                            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.4rem' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '0.85rem', transform: 'translateY(-50%)' }} />
                                <input type="email" required placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.4rem' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '0.85rem', transform: 'translateY(-50%)' }} />
                                <input type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                            </div>
                        </div>

                        {/* Role selection — shown for BOTH login and register */}
                        <div>
                            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.6rem' }}>
                                {isLogin ? 'Sign in as...' : 'I am a...'}
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <label style={{
                                    border: `2px solid ${role === 'user' ? '#2563eb' : '#e2e8f0'}`,
                                    background: role === 'user' ? '#eff6ff' : '#ffffff',
                                    padding: '1rem', borderRadius: '10px', display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s'
                                }}>
                                    <input type="radio" name="role" value="user" checked={role === 'user'} onChange={() => setRole('user')} style={{ display: 'none' }} />
                                    <div style={{ background: role === 'user' ? '#dbeafe' : '#f1f5f9', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <User size={20} color={role === 'user' ? '#2563eb' : '#94a3b8'} />
                                    </div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: role === 'user' ? '#1e3a8a' : '#64748b' }}>Applicant</span>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>Upload & analyze resume</span>
                                </label>
                                <label style={{
                                    border: `2px solid ${role === 'admin' ? '#10b981' : '#e2e8f0'}`,
                                    background: role === 'admin' ? '#f0fdf4' : '#ffffff',
                                    padding: '1rem', borderRadius: '10px', display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s'
                                }}>
                                    <input type="radio" name="role" value="admin" checked={role === 'admin'} onChange={() => setRole('admin')} style={{ display: 'none' }} />
                                    <div style={{ background: role === 'admin' ? '#dcfce7' : '#f1f5f9', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Briefcase size={20} color={role === 'admin' ? '#10b981' : '#94a3b8'} />
                                    </div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: role === 'admin' ? '#064e3b' : '#64748b' }}>Recruiter</span>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>Manage candidates</span>
                                </label>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '0.875rem', borderRadius: '8px', background: '#2563eb', color: '#ffffff',
                            border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            marginTop: '0.5rem', transition: 'background 0.2s', opacity: loading ? 0.7 : 1
                        }}>
                            {loading
                                ? <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                                : <>{isLogin ? 'Sign In' : 'Create Account'} <ChevronRight size={18} /></>}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.95rem', color: '#64748b' }}>
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        <button onClick={() => { setIsLogin(!isLogin); setError(null); }}
                            style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: '0.95rem' }}>
                            {isLogin ? 'Sign up' : 'Log in'}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
        @media (max-width: 768px) {
          .login-panel-left { display: none !important; }
        }
      `}</style>
        </div>
    );
}

export default Login;
