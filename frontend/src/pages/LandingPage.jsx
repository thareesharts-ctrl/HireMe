import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Upload, BarChart2, CheckCircle, FileText, Users, ArrowRight, Star, Zap } from 'lucide-react';

function LandingPage() {
    return (
        <div style={{
            backgroundColor: '#ffffff', minHeight: '100vh',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            overflowX: 'hidden', width: '100%', boxSizing: 'border-box'
        }}>

            {/* ── Navbar ── */}
            <header style={{
                width: '100%', boxSizing: 'border-box',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 5%', height: '64px',
                borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0,
                background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(10px)', zIndex: 100,
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
            }}>
                {/* Brand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '8px',
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 2px 8px rgba(37,99,235,0.3)'
                    }}>
                        H
                    </div>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                        Hire<span style={{ color: '#2563eb' }}>Me</span>
                    </span>
                </div>

                {/* Nav Links */}
                <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem', fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>
                    <a href="#features" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }}
                        onMouseOver={e => e.target.style.color = '#2563eb'} onMouseOut={e => e.target.style.color = '#475569'}>Features</a>
                    <a href="#how" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }}
                        onMouseOver={e => e.target.style.color = '#2563eb'} onMouseOut={e => e.target.style.color = '#475569'}>How it works</a>
                    <a href="#stats" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }}
                        onMouseOver={e => e.target.style.color = '#2563eb'} onMouseOut={e => e.target.style.color = '#475569'}>Stats</a>
                </nav>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '0.6rem', flexShrink: 0 }}>
                    <Link to="/login?mode=login" style={{
                        textDecoration: 'none', padding: '0.45rem 1.1rem', borderRadius: '7px',
                        border: '1.5px solid #e2e8f0', color: '#334155', fontWeight: 600, fontSize: '0.875rem',
                        background: '#ffffff', whiteSpace: 'nowrap', transition: 'all 0.2s'
                    }}>Log In</Link>
                    <Link to="/login?mode=register" style={{
                        textDecoration: 'none', padding: '0.45rem 1.1rem', borderRadius: '7px',
                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#ffffff',
                        fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap',
                        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                        boxShadow: '0 2px 8px rgba(37,99,235,0.35)'
                    }}>Get Started <ArrowRight size={14} /></Link>
                </div>
            </header>

            {/* ── Hero ── */}
            <section style={{
                width: '100%', boxSizing: 'border-box',
                background: 'linear-gradient(150deg, #eff6ff 0%, #f8fafc 45%, #f0fdf4 100%)',
                padding: '6rem 5% 6rem',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                minHeight: 'calc(100vh - 64px)'
            }}>
                <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                        background: '#dbeafe', color: '#1d4ed8', padding: '0.4rem 1.1rem',
                        borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '2rem'
                    }}>
                        <Star size={14} fill="#1d4ed8" /> Trusted by 3M+ students & recruiters
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(2.75rem, 5vw, 4.25rem)', fontWeight: 900, color: '#0f172a',
                        lineHeight: 1.15, letterSpacing: '-0.04em', marginBottom: '1.5rem'
                    }}>
                        Take charge of your career<br /><span style={{ color: '#2563eb' }}>with confidence</span>
                    </h1>
                    <p style={{ fontSize: '1.15rem', color: '#475569', lineHeight: 1.75, marginBottom: '2.5rem', maxWidth: '600px' }}>
                        AI-powered resume analysis, real-time ATS scoring, and tailored skill assessments — for candidates and recruiters alike.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Link to="/login?mode=register" style={{
                            textDecoration: 'none', padding: '0.9rem 2rem', borderRadius: '10px',
                            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#ffffff',
                            fontWeight: 700, fontSize: '1rem',
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            boxShadow: '0 4px 16px rgba(37,99,235,0.38)'
                        }}>Start for Free <ArrowRight size={18} /></Link>
                        <Link to="/login?mode=login" style={{
                            textDecoration: 'none', padding: '0.9rem 2rem', borderRadius: '10px',
                            background: '#ffffff', color: '#0f172a', fontWeight: 700, fontSize: '1rem',
                            border: '1.5px solid #e2e8f0', display: 'inline-flex', alignItems: 'center', gap: '0.5rem'
                        }}>Log In</Link>
                    </div>

                    {/* Trust badges */}
                    <div style={{ display: 'flex', gap: '3rem', marginTop: '4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {[['92%', 'ATS pass rate'], ['30s', 'Analysis time'], ['50K+', 'Resumes scanned']].map(([num, label]) => (
                            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{num}</div>
                                <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500, marginTop: '0.2rem' }}>{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section id="features" style={{ width: '100%', boxSizing: 'border-box', padding: '5.5rem 5%', background: '#ffffff' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', margin: '0 0 0.6rem' }}>Everything you need</h2>
                        <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>One platform for applicants and recruiters</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                        {[
                            { icon: <Upload size={20} color="#2563eb" />, bg: '#eff6ff', title: 'Resume Upload & Parse', desc: 'Drag and drop your PDF resume for instant ATS keyword extraction and scoring.' },
                            { icon: <BarChart2 size={20} color="#10b981" />, bg: '#f0fdf4', title: 'ATS Score Analysis', desc: 'Get your exact ATS visibility score with actionable feedback to improve your rank.' },
                            { icon: <CheckCircle size={20} color="#8b5cf6" />, bg: '#f5f3ff', title: 'Skill Assessments', desc: '30-question MCQ tests generated from your resume skills — prove your expertise.' },
                            { icon: <FileText size={20} color="#f59e0b" />, bg: '#fffbeb', title: 'AI Career Advisor', desc: 'Chat with a Gemini-powered assistant for personalized career and interview guidance.' },
                            { icon: <Users size={20} color="#ef4444" />, bg: '#fef2f2', title: 'Recruiter Pipeline', desc: 'Manage candidates, view ATS scores and test results in one unified place.' },
                            { icon: <Star size={20} color="#0ea5e9" />, bg: '#f0f9ff', title: 'Instant Matching', desc: 'Match candidate profiles with job roles based on extracted skill sets automatically.' },
                            { icon: <Zap size={20} color="#6366f1" />, bg: '#e0e7ff', title: 'Job Search', desc: 'Find and apply to thousands of top-tier jobs and internships directly on our platform.' },
                            { icon: <ArrowRight size={20} color="#0f172a" />, bg: '#f1f5f9', title: 'Know More', desc: 'Discover extra features, interview prep materials, and exclusive expert webinars.' },
                        ].map((f, i) => (
                            <div key={i} style={{
                                background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px',
                                padding: '1.5rem', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default'
                            }}
                                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.09)'; }}
                                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                                <div style={{ background: f.bg, borderRadius: '9px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.875rem' }}>{f.icon}</div>
                                <h3 style={{ fontSize: '0.975rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>{f.title}</h3>
                                <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How it works ── */}
            <section id="how" style={{ width: '100%', boxSizing: 'border-box', padding: '5.5rem 5%', background: '#f8fafc' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', margin: '0 0 3rem' }}>How it works</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                        {[
                            { step: '01', title: 'Create Account', desc: 'Sign up as a Candidate or Recruiter in seconds.' },
                            { step: '02', title: 'Upload Resume', desc: 'Drop your PDF resume on the applier dashboard.' },
                            { step: '03', title: 'Get Your Score', desc: 'Instantly see your ATS score and extracted skills.' },
                            { step: '04', title: 'Take the Test', desc: 'Prove expertise with a personalized skill assessment.' },
                        ].map((s, i) => (
                            <div key={i} style={{ textAlign: 'center', padding: '0' }}>
                                <div style={{ fontSize: '3rem', fontWeight: 900, color: '#dbeafe', letterSpacing: '-0.05em', lineHeight: 1, marginBottom: '0.625rem' }}>{s.step}</div>
                                <h3 style={{ fontSize: '0.975rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>{s.title}</h3>
                                <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Stats ── */}
            <section id="stats" style={{ width: '100%', boxSizing: 'border-box', padding: '5.5rem 5%', background: '#ffffff' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', margin: '0 0 3rem' }}>Trusted by thousands</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                        {[{ num: '3M+', label: 'Students Registered' }, { num: '92%', label: 'ATS Pass Rate' }, { num: '50K+', label: 'Resumes Analyzed' }, { num: '200+', label: 'Partner Recruiters' }].map((s, i) => (
                            <div key={i} style={{ padding: '1.75rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#2563eb', letterSpacing: '-0.03em' }}>{s.num}</div>
                                <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500, marginTop: '0.25rem' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section style={{ width: '100%', boxSizing: 'border-box', padding: '5.5rem 5%', textAlign: 'center', background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, color: '#ffffff', margin: '0 0 1rem', letterSpacing: '-0.03em', lineHeight: 1.2 }}>Ready to land your dream job?</h2>
                    <p style={{ color: '#bfdbfe', fontSize: '1rem', margin: '0 0 2.25rem', lineHeight: 1.65 }}>Join millions of candidates and recruiters using HireMe.</p>
                    <Link to="/login?mode=register" style={{
                        textDecoration: 'none', padding: '0.825rem 2.25rem', borderRadius: '10px',
                        background: '#ffffff', color: '#1e3a8a', fontWeight: 700, fontSize: '0.975rem',
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.18)'
                    }}>Create Free Account <ArrowRight size={16} /></Link>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer style={{ width: '100%', boxSizing: 'border-box', padding: '1.5rem 5%', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', borderTop: '1px solid #e2e8f0' }}>
                © 2026 HireMe. All rights reserved.
            </footer>
        </div>
    );
}

export default LandingPage;
