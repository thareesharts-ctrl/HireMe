import React from 'react';
import { Link } from 'react-router-dom';
import { User, Briefcase, Award } from 'lucide-react';
import '../App.css'; // inherit global styles

function Home() {
    return (
        <div className="app-layout fade-in-up">
            <nav className="navbar" style={{ justifyContent: 'center' }}>
                <div className="nav-brand">
                    <div className="nav-brand-icon">
                        <Award size={22} strokeWidth={2.5} />
                    </div>
                    ResumeScanner Pro
                </div>
            </nav>

            <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <div className="hero-section" style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 className="hero-title">Welcome to <span>ResumeScanner Pro</span></h1>
                    <p className="hero-subtitle">
                        The AI-powered portal for Applicant Tracking and Technical Assessments. Please select your portal configuration to continue.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '800px' }}>

                    {/* Applier Selection */}
                    <Link to="/login" style={{ textDecoration: 'none', color: 'inherit', flex: '1', minWidth: '300px' }}>
                        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ background: '#eff6ff', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                                <User size={40} color="#3b82f6" />
                            </div>
                            <h2 className="card-title" style={{ justifyContent: 'center', marginBottom: '1rem', fontSize: '1.5rem' }}>I am an Applicant</h2>
                            <p className="upload-description" style={{ marginBottom: '0' }}>
                                Upload your resume, see your ATS score, discover missing keywords, and take a personalized skill assessment.
                            </p>
                        </div>
                    </Link>

                    {/* Recruiter Selection */}
                    <Link to="/login" style={{ textDecoration: 'none', color: 'inherit', flex: '1', minWidth: '300px' }}>
                        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ background: '#f0fdf4', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                                <Briefcase size={40} color="#10b981" />
                            </div>
                            <h2 className="card-title" style={{ justifyContent: 'center', marginBottom: '1rem', fontSize: '1.5rem' }}>I am a Recruiter</h2>
                            <p className="upload-description" style={{ marginBottom: '0' }}>
                                Manage candidate pipelines, review parsed ATS profiles, verify candidate test scores, and streamline your hiring.
                            </p>
                        </div>
                    </Link>

                </div>
            </main>
        </div>
    );
}

export default Home;
