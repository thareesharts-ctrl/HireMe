import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, User, Settings, LogOut, ChevronDown, Edit2, Upload, FileText, CheckCircle, Zap, Activity, Layers, Tag, Target, ArrowRight, Bot, Briefcase, Clock, ClipboardList } from 'lucide-react';
import axios from 'axios';

function ApplierDashboard() {
    const [user, setUser] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAssessmentModal, setShowAssessmentModal] = useState(null); // stores the job object applied to
    const [jobs, setJobs] = useState([]);
    const navigate = useNavigate();

    // Profile Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        age: '',
        department: '',
        institute: '',
        domain: '',
        skill: '',
        address: '',
        nationality: '',
        github: '',
        linkedin: '',
        apaarNumber: '',
        desiredJob: ''
    });

    const departments = [
        'B.E. Computer Science and Engineering', 'B.E. Electronics and Communication',
        'B.E. Mechanical Engineering', 'B.E. Civil Engineering', 'B.E. Electrical and Electronics',
        'B.Tech Information Technology', 'B.Tech Artificial Intelligence', 'B.Tech Data Science',
        'M.E. Computer Science', 'M.E. VLSI Design', 'M.E. Structural Engineering',
        'MCA', 'MBA'
    ];

    const desiredJobs = [
        'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
        'Data Scientist', 'Machine Learning Engineer', 'DevOps Engineer',
        'Cloud Architect', 'UI/UX Designer', 'Product Manager', 'Cybersecurity Analyst'
    ];

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);

            // Scope Profile data to this email
            const userProfileStorageKey = `userProfileData_${parsedUser.email}`;
            const storedProfile = localStorage.getItem(userProfileStorageKey);

            const names = parsedUser.name ? parsedUser.name.split(' ') : ['', ''];

            if (storedProfile) {
                setFormData(JSON.parse(storedProfile));
            } else {
                setFormData(prev => ({
                    ...prev,
                    firstName: names[0] || '',
                    lastName: names.slice(1).join(' ') || '',
                    email: parsedUser.email || '',
                    ...parsedUser.profileData // fallback to legacy
                }));
            }

            // Scope Analytics data to this email
            const userAnalyticsStorageKey = `userAnalytics_${parsedUser.email}`;
            const storedAnalytics = localStorage.getItem(userAnalyticsStorageKey);
            if (storedAnalytics) {
                setAnalytics(JSON.parse(storedAnalytics));
            } else {
                setAnalytics(null); // Clear analytics if this specific user has none
            }

            axios.get('http://localhost:5000/api/jobs')
                .then(res => {
                    if (res.data.success) {
                        setJobs(res.data.jobs);
                    }
                })
                .catch(err => console.error("Failed to fetch jobs:", err));

        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            // Push profile to database
            await axios.post('http://localhost:5000/api/update_profile', {
                ...formData,
                email: user.email
            });

            // Scope to the email locally
            const userProfileStorageKey = `userProfileData_${user.email}`;
            const updatedUser = { ...user, name: `${formData.firstName} ${formData.lastName}`.trim() };

            localStorage.setItem(userProfileStorageKey, JSON.stringify(formData)); // save robust profile
            localStorage.setItem('user', JSON.stringify(updatedUser)); // keep session updated

            setUser(updatedUser);
            setShowEditModal(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert("Failed to save to database. Check network connection.");
        }
    };

    const handleApplyJob = async (job) => {
        try {
            await axios.post('http://localhost:5000/api/apply_job', {
                jobId: job._id,
                candidateEmail: user.email,
                recruiterEmail: job.recruiterEmail,
                jobRole: job.role,
                appliedDate: new Date().toISOString().split('T')[0],
                status: "Reviewing"
            });
            setShowAssessmentModal(job);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                alert("You have already applied to this job.");
            } else {
                alert("Failed to send application. Please try again.");
            }
        }
    };

    if (!user) return null;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>

            {/* --- Top Navbar --- */}
            <nav style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.75rem 2rem', backgroundColor: '#ffffff',
                borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50
            }}>

                {/* Logo Container (HireMe) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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

                {/* Central Search Bar */}
                <div style={{ flex: 1, maxWidth: '500px', margin: '0 2rem' }}>
                    <div style={{ position: 'relative', width: '100%' }}>
                        <input
                            type="text"
                            placeholder="Search jobs, companies, exams..."
                            style={{
                                width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem',
                                borderRadius: '999px', border: '1px solid #e2e8f0',
                                backgroundColor: '#f1f5f9', outline: 'none', fontSize: '0.9rem',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => { e.target.style.backgroundColor = '#ffffff'; e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                            onBlur={(e) => { e.target.style.backgroundColor = '#f1f5f9'; e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                        />
                        <Search size={16} color="#64748b" style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)' }} />
                    </div>
                </div>

                {/* Right Actions (Notification + Profile) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ position: 'relative', cursor: 'pointer' }}>
                        <Bell size={22} color="#475569" />
                        <span style={{
                            position: 'absolute', top: '-4px', right: '-4px',
                            backgroundColor: '#ef4444', color: 'white', fontSize: '0.65rem',
                            width: '16px', height: '16px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                        }}>3</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.2rem', borderRadius: '8px' }}
                        onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            backgroundColor: '#dbeafe', color: '#1d4ed8',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 600, fontSize: '1.1rem', border: '2px solid #bfdbfe'
                        }}>
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <Menu size={20} color="#475569" />
                    </div>
                </div>

                {/* Profile Dropdown */}
                {showProfileDropdown && (
                    <div style={{
                        position: 'absolute', top: '70px', right: '2rem',
                        width: '280px', backgroundColor: 'white',
                        borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        border: '1px solid #e2e8f0', overflow: 'hidden', padding: '0.5rem 0'
                    }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '50%',
                                backgroundColor: '#dbeafe', color: '#1d4ed8',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 600, fontSize: '1.4rem'
                            }}>
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, color: '#0f172a' }}>{user.name}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{user.email}</div>
                            </div>
                        </div>

                        <button onClick={() => { setShowEditModal(true); setShowProfileDropdown(false); }}
                            style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#475569', cursor: 'pointer' }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <Edit2 size={16} /> Edit Profile
                        </button>
                        <button style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#475569', cursor: 'pointer' }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <Settings size={16} /> Settings
                        </button>
                        <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '0.5rem 0' }}></div>
                        <button onClick={handleLogout}
                            style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#ef4444', cursor: 'pointer' }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#fef2f2'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <LogOut size={16} /> Sign out
                        </button>
                    </div>
                )}
            </nav>

            {/* --- Main Content --- */}
            <main style={{ padding: '3rem', maxWidth: '1200px', margin: '0 auto' }}>

                {analytics ? (
                    <div className="fade-in-up" style={{ textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                            <div>
                                <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Performance Analytics</h1>
                                <p style={{ color: '#64748b', fontSize: '1.05rem', margin: 0 }}>Review your genuine ATS scores, mock test results, and vital building feedback.</p>
                            </div>
                            <button className="btn-secondary" onClick={() => navigate('/applier/scanner')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white' }}>
                                <Upload size={16} /> Update Resume
                            </button>
                        </div>

                        {/* Top Metrics Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>

                            {/* ATS Score Card */}
                            <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#475569', marginBottom: '1.5rem', width: '100%', justifyContent: 'center' }}>
                                    <Activity size={18} color="#2563eb" /> ATS Resume Score
                                </div>
                                {analytics.atsScore !== undefined ? (
                                    <>
                                        <div className="score-ring" style={{ background: `conic-gradient(${analytics.atsScore >= 80 ? '#10b981' : analytics.atsScore >= 60 ? '#f59e0b' : '#ef4444'} ${analytics.atsScore}%, #e2e8f0 0)`, transform: 'scale(1.2)', margin: '1rem 0 2rem' }}>
                                            <div className="score-inner">
                                                <span className="score-number" style={{ fontSize: '2rem' }}>{analytics.atsScore}</span>
                                            </div>
                                        </div>
                                        <div className={`badge ${analytics.atsScore >= 80 ? 'badge-excellent' : analytics.atsScore >= 60 ? 'badge-good' : 'badge-needs-work'}`}>
                                            {analytics.atsScore >= 80 ? 'High Visibility' : analytics.atsScore >= 60 ? 'Average Match' : 'Critical Warning'}
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No ATS data available. Upload your resume first.</div>
                                )}
                            </div>

                            {/* Mock Test Score Card */}
                            <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#475569', marginBottom: '1.5rem', width: '100%', justifyContent: 'center' }}>
                                    <Target size={18} color="#8b5cf6" /> Mock Tech Test Score
                                </div>
                                {analytics.mockScore !== undefined ? (
                                    <>
                                        <div className="score-ring" style={{ background: `conic-gradient(${analytics.mockScore >= 80 ? '#10b981' : analytics.mockScore >= 60 ? '#f59e0b' : '#ef4444'} ${analytics.mockScore}%, #e2e8f0 0)`, transform: 'scale(1.2)', margin: '1rem 0 2rem' }}>
                                            <div className="score-inner">
                                                <span className="score-number" style={{ fontSize: '2rem' }}>{analytics.mockScore}%</span>
                                            </div>
                                        </div>
                                        <div className={`badge ${analytics.mockScore >= 80 ? 'badge-excellent' : analytics.mockScore >= 60 ? 'badge-good' : 'badge-needs-work'}`} style={{ backgroundColor: '#f3f4f6', color: '#475569', border: 'none' }}>
                                            Domain: {analytics.mockDomain || "Extracted Skills"}
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                                        No test data generated yet.<br />
                                        <button className="btn-primary" onClick={() => navigate('/applier/mock')} style={{ marginTop: '1rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Take Mock Test</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Vital Analysis & Feedback Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 3.5fr) minmax(300px, 6.5fr)', gap: '1.5rem' }}>

                            {/* Skills View */}
                            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                <div style={{ background: '#f8fafc', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', fontWeight: 700, display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#0f172a' }}>
                                    <Layers size={18} color="#2563eb" /> Vital Skill Analysis
                                </div>
                                <div style={{ padding: '1.5rem' }}>
                                    {analytics.skills && analytics.skills.length > 0 ? (
                                        <div className="skills-wrapper">
                                            {analytics.skills.map((skill, idx) => (
                                                <div key={idx} className="skill-badge" style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0' }}>
                                                    <Tag size={12} color="#64748b" /> {skill}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No skills captured to analyze.</p>
                                    )}
                                </div>
                            </div>

                            {/* Resume Feedback */}
                            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                <div style={{ background: '#f8fafc', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', fontWeight: 700, display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#0f172a' }}>
                                    <FileText size={18} color="#059669" /> Strong Build Feedback Section
                                </div>
                                <div style={{ padding: '1.5rem' }}>
                                    {analytics.feedback && analytics.feedback.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {analytics.feedback.map((item, idx) => {
                                                const isPositive = item.includes("Great") || item.includes("Strong") || item.includes("Found");
                                                return (
                                                    <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.95rem', color: '#334155', lineHeight: 1.5 }}>
                                                        <div style={{ flexShrink: 0, marginTop: '2px' }}>
                                                            {isPositive ? <CheckCircle size={18} color="#10b981" /> : <Zap size={18} color="#f59e0b" />}
                                                        </div>
                                                        {item}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Upload your resume to receive actionable construction feedback.</p>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Actionable Next Steps (The 'Lost' Section) */}
                        <div style={{ marginTop: '3rem', borderTop: '1px solid #e2e8f0', paddingTop: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>Continue Your Journey</h2>
                            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                                {[
                                    { title: 'Take DomainMock Assessment', icon: <CheckCircle size={18} color="#8b5cf6" />, path: '/applier/mock' },
                                    { title: 'Get Career Guidance', icon: <Zap size={18} color="#ec4899" />, path: '/applier/guidance' },
                                    { title: 'AI Mock Interview', icon: <Bot size={18} color="#3b82f6" />, path: '/applier/assistant-interview' },
                                    { title: 'Find Jobs & Internships', icon: <Search size={18} color="#10b981" /> }
                                ].map((card, i) => (
                                    <div key={i}
                                        onClick={() => card.path ? navigate(card.path) : null}
                                        style={{
                                            background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0',
                                            flex: '1 1 250px', display: 'flex', alignItems: 'center', gap: '1rem',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: card.path ? 'pointer' : 'default',
                                            transition: 'all 0.2s', textAlign: 'left'
                                        }}
                                        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                                        onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                                        <div style={{ padding: '0.6rem', borderRadius: '50%', background: '#f8fafc' }}>
                                            {card.icon}
                                        </div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>
                                            {card.title}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                ) : (
                    // Default Initial Layout
                    <div className="fade-in-up" style={{ textAlign: 'center' }}>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                            Take charge of your career<br />with confidence
                        </h1>
                        <p style={{ color: '#64748b', marginBottom: '3rem', fontSize: '1.1rem' }}>
                            Explore opportunities, take assessments, and improve your resume score.
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                            {/* Functional tiles */}
                            {[
                                { title: 'Upload Resume & Get ATS Score', icon: <Upload size={20} color="#2563eb" />, path: '/applier/scanner' },
                                { title: 'Take Domain Mock Assessment', icon: <CheckCircle size={20} color="#8b5cf6" />, path: '/applier/mock' },
                                { title: 'Get career guidance', icon: <Zap size={20} color="#ec4899" />, path: '/applier/guidance' },
                                { title: 'AI Mock Interview', icon: <Bot size={20} color="#3b82f6" />, path: '/applier/assistant-interview' },
                                { title: 'Find jobs & internships', icon: <Search size={20} color="#10b981" /> }
                            ].map((card, i) => (
                                <div key={i}
                                    onClick={() => card.path ? navigate(card.path) : null}
                                    style={{
                                        background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0',
                                        width: '100%', maxWidth: '300px', display: 'flex', alignItems: 'center', gap: '1rem',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: card.path ? 'pointer' : 'default',
                                        transition: 'all 0.2s', textAlign: 'left'
                                    }}
                                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                                    onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                                    <div style={{ padding: '0.75rem', borderRadius: '50%', background: '#f8fafc' }}>
                                        {card.icon}
                                    </div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>
                                        {card.title}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- Community Job Openings Section --- */}
                <div style={{ marginTop: '3rem', borderTop: '1px solid #e2e8f0', paddingTop: '2.5rem', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Briefcase size={24} color="#2563eb" />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Community Job Openings</h2>
                    </div>
                    {jobs.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {jobs.map((job) => (
                                <div key={job._id} style={{
                                    background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0',
                                    padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                                }}>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{job.role}</h3>
                                            <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>New</span>
                                        </div>
                                        <p style={{ color: '#059669', fontSize: '0.9rem', fontWeight: 600, margin: '0 0 1rem 0' }}>{job.companyName}</p>
                                        <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
                                            {job.description}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Posted by {job.recruiterName}</span>
                                        <button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => handleApplyJob(job)}>
                                            Apply Now
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                            <Briefcase size={32} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                            <p style={{ margin: 0 }}>No active job openings right now. Check back soon!</p>
                        </div>
                    )}
                </div>

            </main>


            {/* --- Profile Edit Modal --- */}
            {showEditModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
                    <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '700px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>

                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Edit Profile Details</h2>
                            <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>&times;</button>
                        </div>

                        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
                            <form id="profileForm" onSubmit={handleProfileUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

                                {/* Name */}
                                <div><label className="modal-label">First Name</label><input type="text" className="modal-input" required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} /></div>
                                <div><label className="modal-label">Last Name</label><input type="text" className="modal-input" required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} /></div>

                                {/* Email / Age */}
                                <div><label className="modal-label">Email</label><input type="email" className="modal-input" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} disabled style={{ backgroundColor: '#f1f5f9', color: '#64748b' }} /></div>
                                <div><label className="modal-label">Age</label><input type="number" className="modal-input" required min="16" max="100" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} /></div>

                                {/* Institute & Dept */}
                                <div style={{ gridColumn: '1 / -1' }}><label className="modal-label">Institute Name</label><input type="text" className="modal-input" required placeholder="e.g. Indian Institute of Technology Madras" value={formData.institute} onChange={e => setFormData({ ...formData, institute: e.target.value })} /></div>

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label className="modal-label">Department</label>
                                    <select className="modal-input" required value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                                        <option value="" disabled>Select Department</option>
                                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>

                                {/* Domain & Skill */}
                                <div><label className="modal-label">Domain</label><input type="text" className="modal-input" required placeholder="e.g. Software Development" value={formData.domain} onChange={e => setFormData({ ...formData, domain: e.target.value })} /></div>
                                <div><label className="modal-label">Primary Skill (Mark it big)</label><input type="text" className="modal-input" required placeholder="e.g. React.js" value={formData.skill} onChange={e => setFormData({ ...formData, skill: e.target.value })} style={{ border: '2px solid #2563eb', fontWeight: 'bold' }} /></div>

                                {/* Desired Job */}
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label className="modal-label">Desired Job Role</label>
                                    <select className="modal-input" required value={formData.desiredJob} onChange={e => setFormData({ ...formData, desiredJob: e.target.value })}>
                                        <option value="" disabled>Select target role</option>
                                        {desiredJobs.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>

                                {/* Address & Nationality */}
                                <div><label className="modal-label">Address</label><input type="text" className="modal-input" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} /></div>
                                <div><label className="modal-label">Nationality</label><input type="text" className="modal-input" value={formData.nationality} onChange={e => setFormData({ ...formData, nationality: e.target.value })} /></div>

                                {/* Links / Numbers */}
                                <div><label className="modal-label">GitHub Profile Link</label><input type="url" className="modal-input" placeholder="https://github.com/..." value={formData.github} onChange={e => setFormData({ ...formData, github: e.target.value })} /></div>
                                <div><label className="modal-label">LinkedIn Profile Link</label><input type="url" className="modal-input" placeholder="https://linkedin.com/in/..." value={formData.linkedin} onChange={e => setFormData({ ...formData, linkedin: e.target.value })} /></div>

                                <div style={{ gridColumn: '1 / -1' }}><label className="modal-label">APAAR Number (Academic Bank of Credits)</label><input type="text" className="modal-input" placeholder="12-digit APAAR ID" value={formData.apaarNumber} onChange={e => setFormData({ ...formData, apaarNumber: e.target.value })} /></div>

                            </form>
                        </div>

                        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '1rem', backgroundColor: '#f8fafc', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
                            <button type="button" onClick={() => setShowEditModal(false)} style={{ padding: '0.6rem 1.25rem', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white', fontWeight: 600, cursor: 'pointer', color: '#475569' }}>Cancel</button>
                            <button type="submit" form="profileForm" style={{ padding: '0.6rem 1.25rem', border: 'none', borderRadius: '8px', background: '#2563eb', fontWeight: 600, cursor: 'pointer', color: 'white' }}>Save Profile</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assessment Scheduling Modal */}
            {showAssessmentModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
                    <div className="fade-in-up" style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
                        <div style={{ background: '#ecfdf5', padding: '1.5rem', borderBottom: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ background: '#10b981', color: 'white', padding: '0.5rem', borderRadius: '50%' }}>
                                <CheckCircle size={28} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#064e3b' }}>You Gotcha!</h2>
                                <p style={{ color: '#065f46', margin: '0.25rem 0 0 0', fontSize: '0.95rem', fontWeight: 500 }}>Your profile has been sent to the recruiter.</p>
                            </div>
                        </div>

                        <div style={{ padding: '2rem' }}>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#0f172a' }}>Next Step: Assessment Scheduled</h3>
                            <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                                To proceed with the application for <strong>{showAssessmentModal.role}</strong> at <strong>{showAssessmentModal.companyName}</strong>, you must complete the required skills assessment quiz.
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <ClipboardList size={22} color="#2563eb" />
                                    <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>40 Questions</span>
                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>20 Aptitude<br />20 Technical</span>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <Clock size={22} color="#f59e0b" />
                                    <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>60 Minutes</span>
                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Timed Test<br />Auto-submission</span>
                                </div>
                            </div>

                            <div style={{ padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', color: '#b91c1c', fontSize: '0.8rem', lineHeight: '1.4' }}>
                                <strong>Note:</strong> Gemini generation is currently cooling down. A comprehensive mock assessment interface will load in the meantime. Have a stable connection!
                            </div>
                        </div>

                        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '1rem', backgroundColor: '#f8fafc' }}>
                            <button onClick={() => setShowAssessmentModal(null)} className="btn-secondary" style={{ flex: 1, padding: '0.85rem', background: 'white' }}>Take Later</button>
                            <button onClick={() => navigate(`/applier/assessment/${showAssessmentModal._id}`)} className="btn-primary" style={{ flex: 1, padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#10b981' }}>
                                Start Quiz Now <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Global styles for modal inputs */}
            <style>{`
        .modal-label { display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem; }
        .modal-input { width: 100%; box-sizing: border-box; padding: 0.6rem 0.75rem; border-radius: 6px; border: 1px solid #cbd5e1; outline: none; font-size: 0.95rem; font-family: inherit; }
        .modal-input:focus { border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37,99,235,0.1); }
      `}</style>
        </div>
    );
}

export default ApplierDashboard;
