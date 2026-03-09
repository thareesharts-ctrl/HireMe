import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Users, Search, Filter, CheckCircle, XCircle, MoreVertical,
    Activity, Award, ArrowLeft, Menu, Settings, LogOut, Edit2, Briefcase, PlusCircle, Building2, Mail, CreditCard, Hash, Eye
} from 'lucide-react';
import '../App.css';



function RecruiterDashboard() {
    const [candidates, setCandidates] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [generatedEmail, setGeneratedEmail] = useState({ content: '', candidate: '' });

    // Layout State
    const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' or 'candidates'
    const [jobs, setJobs] = useState([]);

    // Profile Edit State
    const [showEditModal, setShowEditModal] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '', companyName: '', role: '', panNumber: '', msmeNumber: '', email: ''
    });

    // Job Posting State
    const [jobData, setJobData] = useState({
        role: '', description: '', vacancies: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);

            // Fetch Recruiter DB Profile
            axios.post('http://127.0.0.1:5000/api/get_user', { email: parsedUser.email })
                .then(res => {
                    if (res.data.success && res.data.user) {
                        const dbUser = res.data.user;
                        if (dbUser.recruiter_profile) {
                            setProfileData(prev => ({ ...prev, ...dbUser.recruiter_profile }));
                        } else {
                            setProfileData(prev => ({ ...prev, name: parsedUser.name || '', email: parsedUser.email || '' }));
                        }
                    }
                })
                .catch(err => {
                    console.error("Failed to fetch recruiter profile:", err);
                    setProfileData(prev => ({ ...prev, name: parsedUser.name || '', email: parsedUser.email || '' }));
                });
        } else {
            navigate('/login');
        }

        const fetchCandidates = async (recruiterEmail) => {
            try {
                const response = await axios.get(`http://127.0.0.1:5000/api/recruiter_candidates?email=${recruiterEmail}`);
                if (response.data.success) {
                    setCandidates([...response.data.candidates]);
                }
            } catch (error) {
                console.error("Failed to fetch candidates", error);
                setCandidates([]); // Keep it empty if failing
            } finally {
                setIsLoading(false);
            }
        };

        const fetchJobs = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/api/jobs');
                if (response.data.success) {
                    setJobs(response.data.jobs);
                }
            } catch (error) {
                console.error("Failed to fetch jobs", error);
            }
        };

        const currentData = localStorage.getItem('user');
        if (currentData) {
            const parsedUser = JSON.parse(currentData);
            fetchCandidates(parsedUser.email);
        }
        fetchJobs();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://127.0.0.1:5000/api/update_recruiter_profile', {
                ...profileData,
                email: user.email
            });
            const updatedUser = { ...user, name: profileData.name };
            localStorage.setItem('user', JSON.stringify(updatedUser)); // keep session updated
            setUser(updatedUser);
            setShowEditModal(false);
            alert('Recruiter profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert("Failed to save profile.");
        }
    };

    const handlePostJob = async (e) => {
        e.preventDefault();
        try {
            const jobPayload = {
                ...jobData,
                recruiterEmail: user.email,
                recruiterName: profileData.name,
                companyName: profileData.companyName || 'Unknown Company',
                datePosted: new Date().toISOString()
            };
            const res = await axios.post('http://127.0.0.1:5000/api/post_job', jobPayload);
            if (res.data.success) {
                setJobs([{ ...jobPayload, _id: res.data.jobId }, ...jobs]); // Real update with actual ID
            }
            setJobData({ role: '', description: '', vacancies: '' });
            setShowSuccessModal(true);
            setTimeout(() => setShowSuccessModal(false), 3000); // Auto-hide after 3s
        } catch (error) {
            console.error('Error posting job:', error);
            alert("Failed to post job.");
        }
    };

    const handleClosePosition = async (jobId) => {
        if (!window.confirm("Are you sure you want to close this job position? It will be removed from all candidate dashboards permanently.")) return;

        try {
            const res = await axios.delete(`http://127.0.0.1:5000/api/delete_job?id=${jobId}`);
            if (res.data.success) {
                setJobs(prevJobs => prevJobs.filter(j => j._id !== jobId));
            }
        } catch (error) {
            console.error("Failed to delete job:", error);
            alert("Error closing position. Please check your connection.");
        }
    };

    const filteredCandidates = candidates.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const myJobs = jobs.filter(j => j.recruiterEmail === user?.email);

    const handleStatusChange = async (cand, newStatus) => {
        if (!cand.email) {
            alert("Cannot update mock candidate status.");
            return;
        }
        try {
            const response = await axios.post('http://127.0.0.1:5000/api/update_status', {
                email: cand.email,
                candidateName: cand.name,
                jobRole: cand.role,
                recruiterName: profileData.name || "HireMe Recruiter",
                companyName: profileData.companyName || "HireMe Partner",
                status: newStatus
            });

            if (response.data.success) {
                setCandidates(candidates.map(c =>
                    c.id === cand.id ? { ...c, status: newStatus } : c
                ));

                if (newStatus === "Hired" && response.data.emailContent) {
                    setGeneratedEmail({
                        content: response.data.emailContent,
                        candidate: cand.name
                    });
                    setShowEmailModal(true);
                } else {
                    alert(`Candidate status updated to ${newStatus}.`);
                }
            }
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update candidate status.");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Hired': return 'badge-good';
            case 'Reviewing': return 'badge-excellent';
            case 'Rejected': return 'badge-needs-work';
            default: return 'badge-needs-work';
        }
    };

    if (!user) return null;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>

            {/* Top Navbar */}
            <nav style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.75rem 2rem', backgroundColor: '#ffffff',
                borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <Link to="/" className="btn-secondary" style={{ padding: '0.4rem 0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'center', textDecoration: 'none', color: '#1e293b' }}>
                        <ArrowLeft size={16} /> Back
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '8px',
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 2px 8px rgba(37,99,235,0.3)'
                        }}>H</div>
                        <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                            Hire<span style={{ color: '#2563eb' }}>Me</span> <span style={{ color: '#64748b', fontSize: '1rem', fontWeight: 600 }}>Recruiter</span>
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.2rem', borderRadius: '8px' }}
                        onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
                        <Menu size={20} color="#475569" />
                    </div>
                </div>

                {showProfileDropdown && (
                    <div style={{
                        position: 'absolute', top: '70px', right: '2rem',
                        width: '200px', backgroundColor: 'white',
                        borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        border: '1px solid #e2e8f0', overflow: 'hidden', padding: '0.5rem 0'
                    }}>
                        <button onClick={handleLogout}
                            style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#ef4444', cursor: 'pointer' }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#fef2f2'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <LogOut size={16} /> Sign out
                        </button>
                    </div>
                )}
            </nav>

            <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 300px) 1fr', gap: '2rem', alignItems: 'start' }}>

                    {/* Left Sidebar - Profile Card */}
                    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                        <div style={{ height: '80px', background: 'linear-gradient(135deg, #1e293b, #334155)' }}></div>
                        <div style={{ padding: '0 1.5rem 1.5rem', textAlign: 'center', position: 'relative' }}>
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8',
                                fontSize: '2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '-40px auto 1rem', border: '4px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                            }}>
                                {user?.name?.charAt(0).toUpperCase() || 'R'}
                            </div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#0f172a' }}>{profileData.name || user?.name}</h2>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 500 }}>{profileData.role || 'Recruiter Role'} at {profileData.companyName || 'Company Not Set'}</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569', fontSize: '0.85rem' }}>
                                    <Mail size={16} style={{ flexShrink: 0 }} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569', fontSize: '0.85rem' }}>
                                    <Building2 size={16} style={{ flexShrink: 0 }} /> <span>{profileData.companyName || 'N/A'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569', fontSize: '0.85rem' }}>
                                    <CreditCard size={16} style={{ flexShrink: 0 }} /> <span>PAN: <span style={{ fontWeight: 600 }}>{profileData.panNumber || 'N/A'}</span></span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569', fontSize: '0.85rem' }}>
                                    <Hash size={16} style={{ flexShrink: 0 }} /> <span>MSME: <span style={{ fontWeight: 600 }}>{profileData.msmeNumber || 'N/A'}</span></span>
                                </div>
                            </div>

                            <button onClick={() => setShowEditModal(true)} style={{ marginTop: '1.5rem', width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white', fontWeight: 600, cursor: 'pointer', color: '#0f172a', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'white'}>
                                <Edit2 size={16} /> Edit Profile
                            </button>
                        </div>
                    </div>

                    {/* Right Component Area */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Tab Switcher */}
                        <div style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                            <button
                                onClick={() => setActiveTab('jobs')}
                                style={{
                                    background: 'none', border: 'none', fontWeight: 600, fontSize: '1.05rem', cursor: 'pointer',
                                    padding: '0.5rem 0', color: activeTab === 'jobs' ? '#2563eb' : '#64748b',
                                    borderBottom: activeTab === 'jobs' ? '2px solid #2563eb' : '2px solid transparent'
                                }}
                            >
                                Job Postings & Openings
                            </button>
                            <button
                                onClick={() => setActiveTab('candidates')}
                                style={{
                                    background: 'none', border: 'none', fontWeight: 600, fontSize: '1.05rem', cursor: 'pointer',
                                    padding: '0.5rem 0', color: activeTab === 'candidates' ? '#2563eb' : '#64748b',
                                    borderBottom: activeTab === 'candidates' ? '2px solid #2563eb' : '2px solid transparent'
                                }}
                            >
                                Candidate Search
                            </button>
                        </div>

                        {/* TAB: JOB POSTINGS */}
                        {activeTab === 'jobs' && (
                            <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                                {/* Post Job Form */}
                                <div className="card" style={{ padding: '2rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
                                        <Briefcase size={20} color="#2563eb" /> Post a New Job Opening
                                    </h2>
                                    <form onSubmit={handlePostJob} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 150px', gap: '1.25rem', alignItems: 'end' }}>
                                        <div style={{ gridColumn: '1 / 2' }}>
                                            <label className="modal-label" style={{ marginBottom: '0.4rem', color: '#475569', fontWeight: 600, fontSize: '0.85rem', display: 'block' }}>Job Role / Title</label>
                                            <input type="text" className="modal-input" required placeholder="e.g. Senior React Developer" value={jobData.role} onChange={e => setJobData({ ...jobData, role: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                                        </div>
                                        <div style={{ gridColumn: '2 / 3' }}>
                                            <label className="modal-label" style={{ marginBottom: '0.4rem', color: '#475569', fontWeight: 600, fontSize: '0.85rem', display: 'block' }}>Vacancies</label>
                                            <input type="number" min="1" className="modal-input" required placeholder="e.g. 3" value={jobData.vacancies} onChange={e => setJobData({ ...jobData, vacancies: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                                        </div>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label className="modal-label" style={{ marginBottom: '0.4rem', color: '#475569', fontWeight: 600, fontSize: '0.85rem', display: 'block' }}>Job Description</label>
                                            <textarea className="modal-input" required rows="4" placeholder="Provide details about the role, requirements, and benefits..." value={jobData.description} onChange={e => setJobData({ ...jobData, description: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }}></textarea>
                                        </div>
                                        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                            <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem', fontWeight: 600, fontSize: '0.95rem' }}>Publish Job</button>
                                        </div>
                                    </form>
                                </div>

                                {/* List of previously posted jobs */}
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1.25rem 0', color: '#0f172a' }}>Your Active Openings</h3>
                                    {myJobs.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {myJobs.map(job => (
                                                <div key={job._id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                                    <div style={{ paddingRight: '1rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{job.role}</h4>
                                                            <span style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#059669', padding: '0.2rem 0.6rem', borderRadius: '99px', fontWeight: 600 }}>{job.vacancies} Vacancies</span>
                                                        </div>
                                                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', display: '-webkit-box' }}>
                                                            {job.description}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleClosePosition(job._id)}
                                                        style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        title="Close Position"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ padding: '3rem 2rem', textAlign: 'center', backgroundColor: 'white', color: '#94a3b8', border: '1px dashed #cbd5e1', borderRadius: '16px' }}>
                                            <Briefcase size={32} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                                            <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 500 }}>No job openings have been posted yet.</p>
                                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>Use the form above to add your first vacancy.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB: CANDIDATE SEARCH/PIPELINE */}
                        {activeTab === 'candidates' && (
                            <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                                <div className="stats-grid" style={{ display: 'flex', gap: '1rem' }}>
                                    <div className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
                                        <div style={{ background: '#eff6ff', borderRadius: '50%', padding: '0.75rem' }}>
                                            <Users size={24} color="#3b82f6" />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{candidates.length}</div>
                                            <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem' }}>Total Candidates</div>
                                        </div>
                                    </div>
                                    <div className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
                                        <div style={{ background: '#f0fdf4', borderRadius: '50%', padding: '0.75rem' }}>
                                            <Activity size={24} color="#10b981" />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{candidates.filter(c => c.atsScore > 80).length}</div>
                                            <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem' }}>Top Matches</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card" style={{ padding: '2rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                                            <input
                                                type="text"
                                                placeholder="Search candidates or roles..."
                                                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc' }}
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                onFocus={e => { e.target.style.background = 'white'; e.target.style.borderColor = '#2563eb' }}
                                                onBlur={e => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = '#cbd5e1' }}
                                            />
                                            <Search size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                        </div>
                                    </div>

                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Candidate</th>
                                                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Applied Role</th>
                                                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Applied Date</th>
                                                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>ATS Match</th>
                                                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Test Score</th>
                                                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Status</th>
                                                    <th style={{ padding: '1rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredCandidates.map((cand) => (
                                                    <tr key={cand.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                                        <td style={{ padding: '1rem 0.5rem', fontWeight: 600, color: '#0f172a' }}>{cand.name}</td>
                                                        <td style={{ padding: '1rem 0.5rem', color: '#475569', fontSize: '0.95rem' }}>{cand.role}</td>
                                                        <td style={{ padding: '1rem 0.5rem', color: '#64748b', fontSize: '0.9rem' }}>{cand.date}</td>
                                                        <td style={{ padding: '1rem 0.5rem' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <div className="progress-bar" style={{ width: '50px', background: '#e2e8f0', height: '6px' }}>
                                                                    <div style={{ width: `${cand.atsScore}%`, background: cand.atsScore >= 80 ? '#10b981' : cand.atsScore >= 60 ? '#f59e0b' : '#ef4444', height: '100%', borderRadius: '1rem' }} />
                                                                </div>
                                                                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{cand.atsScore}%</span>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '1rem 0.5rem' }}>
                                                            {cand.testScore !== null ? (
                                                                <span style={{ fontWeight: 600, color: cand.testScore > 80 ? '#10b981' : '#475569' }}>{cand.testScore}%</span>
                                                            ) : <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Not Taken</span>}
                                                        </td>
                                                        <td style={{ padding: '1rem 0.5rem' }}>
                                                            <span className={`badge ${getStatusBadge(cand.status)}`} style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', borderRadius: '99px' }}>
                                                                {cand.status}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                                <button style={{ background: '#eff6ff', border: '1px solid #bfdbfe', cursor: 'pointer', color: '#1d4ed8', padding: '0.4rem', borderRadius: '6px', transition: 'all 0.2s' }} title="View Profile" onClick={() => setSelectedCandidate(cand)}>
                                                                    <Eye size={16} />
                                                                </button>
                                                                <button style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', cursor: 'pointer', color: '#10b981', padding: '0.4rem', borderRadius: '6px', transition: 'all 0.2s' }} title="Accept Candidate" onClick={() => handleStatusChange(cand, 'Hired')}>
                                                                    <CheckCircle size={16} />
                                                                </button>
                                                                <button style={{ background: '#fef2f2', border: '1px solid #fecaca', cursor: 'pointer', color: '#ef4444', padding: '0.4rem', borderRadius: '6px', transition: 'all 0.2s' }} title="Reject Candidate" onClick={() => handleStatusChange(cand, 'Rejected')}>
                                                                    <XCircle size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {filteredCandidates.length === 0 && (
                                                    <tr>
                                                        <td colSpan="7" style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
                                                            <Search size={32} style={{ margin: '0 auto 1rem auto', opacity: 0.3 }} />
                                                            <div style={{ fontSize: '1.05rem', fontWeight: 500 }}>No candidates found matching your criteria.</div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </main>

            {/* Profile Edit Modal */}
            {showEditModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
                    <div className="fade-in-up" style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>Recruiter Profile</h2>
                            <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>&times;</button>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <form id="recruiterProfileForm" onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div><label className="modal-label">Your Name</label><input type="text" className="modal-input" required value={profileData.name} onChange={e => setProfileData({ ...profileData, name: e.target.value })} /></div>
                                <div><label className="modal-label">Email ID</label><input type="email" className="modal-input" disabled value={profileData.email} style={{ backgroundColor: '#f1f5f9' }} /></div>
                                <div><label className="modal-label">Company Name</label><input type="text" className="modal-input" required value={profileData.companyName} onChange={e => setProfileData({ ...profileData, companyName: e.target.value })} /></div>
                                <div><label className="modal-label">Role in Company</label><input type="text" className="modal-input" required value={profileData.role} onChange={e => setProfileData({ ...profileData, role: e.target.value })} /></div>
                                <div><label className="modal-label">Company PAN Number</label><input type="text" className="modal-input" required value={profileData.panNumber} onChange={e => setProfileData({ ...profileData, panNumber: e.target.value })} /></div>
                                <div><label className="modal-label">MSME Number</label><input type="text" className="modal-input" required value={profileData.msmeNumber} onChange={e => setProfileData({ ...profileData, msmeNumber: e.target.value })} /></div>
                            </form>
                        </div>
                        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '1rem', backgroundColor: '#f8fafc', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
                            <button type="button" onClick={() => setShowEditModal(false)} style={{ padding: '0.6rem 1.25rem', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white', fontWeight: 600, cursor: 'pointer', color: '#475569' }}>Cancel</button>
                            <button type="submit" form="recruiterProfileForm" style={{ padding: '0.6rem 1.25rem', border: 'none', borderRadius: '8px', background: '#2563eb', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Save Profile</button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Candidate Profile Modal */}
            {selectedCandidate && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
                    <div className="fade-in-up" style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '650px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#0f172a' }}>{selectedCandidate.name}</h2>
                                <span style={{ color: '#64748b', fontSize: '0.95rem' }}>Applied for: <span style={{ fontWeight: 600, color: '#334155' }}>{selectedCandidate.role}</span></span>
                            </div>
                            <button onClick={() => setSelectedCandidate(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>&times;</button>
                        </div>

                        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '12px', gridColumn: 'span 2' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>ATS Match</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: selectedCandidate.atsScore >= 80 ? '#10b981' : '#f59e0b' }}>{selectedCandidate.atsScore}%</div>
                                </div>
                                <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '12px', gridColumn: 'span 3', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Assessment Score</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: selectedCandidate.testScore !== null ? (selectedCandidate.testScore >= 80 ? '#10b981' : '#3b82f6') : '#94a3b8' }}>
                                            {selectedCandidate.testScore !== null ? `${selectedCandidate.testScore}%` : 'Not Taken'}
                                        </div>
                                        {selectedCandidate.testScore !== null && selectedCandidate.aptitudeScore !== undefined && selectedCandidate.aptitudeScore !== null && (
                                            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                                                <div style={{ background: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Apt: {selectedCandidate.aptitudeScore}/20</div>
                                                <div style={{ background: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Tech: {selectedCandidate.technicalScore}/20</div>
                                                <div style={{ background: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>DSA: {selectedCandidate.dsaScore}/10</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Applicant Profile Details</h3>

                            {selectedCandidate.profile && Object.keys(selectedCandidate.profile).length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.25rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Email Address</span>
                                        <span style={{ color: '#334155', fontWeight: 500 }}>{selectedCandidate.email}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Age / Nationality</span>
                                        <span style={{ color: '#334155', fontWeight: 500 }}>{selectedCandidate.profile.age} &bull; {selectedCandidate.profile.nationality || 'Unspecified'}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', gridColumn: '1 / -1' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Institution & Department</span>
                                        <span style={{ color: '#334155', fontWeight: 500 }}>{selectedCandidate.profile.institute} - {selectedCandidate.profile.department}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Domain / Top Skill</span>
                                        <span style={{ color: '#334155', fontWeight: 500 }}>{selectedCandidate.profile.domain} <br /> <span style={{ color: '#2563eb', fontWeight: 700, marginTop: '4px', display: 'inline-block' }}>{selectedCandidate.profile.skill}</span></span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Full Location Address</span>
                                        <span style={{ color: '#334155', fontWeight: 500 }}>{selectedCandidate.profile.address || 'Not Provided'}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>APAAR ID</span>
                                        <span style={{ color: '#334155', fontWeight: 500, letterSpacing: '1px' }}>{selectedCandidate.profile.apaarNumber || 'N/A'}</span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', gridColumn: '1 / -1', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', flexWrap: 'wrap' }}>
                                        {selectedCandidate.profile.github && (
                                            <a href={selectedCandidate.profile.github} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', padding: '0.6rem 1.25rem', background: '#334155', color: 'white', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>GitHub Profile</a>
                                        )}
                                        {selectedCandidate.profile.linkedin && (
                                            <a href={selectedCandidate.profile.linkedin} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', padding: '0.6rem 1.25rem', background: '#0284c7', color: 'white', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>LinkedIn Profile</a>
                                        )}
                                        {selectedCandidate.resumeUrl ? (
                                            <a href={selectedCandidate.resumeUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', padding: '0.6rem 1.25rem', background: '#dc2626', color: 'white', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)' }}>
                                                <FileText size={18} /> View PDF Resume
                                            </a>
                                        ) : (
                                            <div style={{ padding: '0.6rem 1.25rem', background: '#f1f5f9', color: '#64748b', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, border: '1px dashed #cbd5e1' }}>No Resume Uploaded</div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', color: '#64748b' }}>
                                    <Users size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                    This candidate hasn't completed their extensive profile yet.
                                </div>
                            )}

                        </div>
                        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#f8fafc' }}>
                            <button onClick={() => setSelectedCandidate(null)} style={{ padding: '0.6rem 2rem', border: 'none', borderRadius: '8px', background: '#2563eb', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Toast / Modal */}
            {showSuccessModal && (
                <div className="fade-in-up" style={{
                    position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 150,
                    background: '#10b981', color: 'white', padding: '1rem 1.5rem',
                    borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem',
                    boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)'
                }}>
                    <CheckCircle size={24} color="white" />
                    <div>
                        <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>Published Successfully!</h4>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', opacity: 0.9 }}>Job opening is now live for candidates.</p>
                    </div>
                </div>
            )}

            {/* AI Generated Email Modal */}
            {showEmailModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(10px)' }}>
                    <div className="fade-in-up" style={{ background: '#f8fafc', borderRadius: '24px', width: '100%', maxWidth: '750px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.8)' }}>
                        {/* Browser-like Header */}
                        <div style={{ background: '#f1f5f9', padding: '1.25rem 1.75rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                            <div style={{ display: 'flex', gap: '0.6rem' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }}></div>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }}></div>
                            </div>
                            <div style={{ flex: 1, background: '#ffffff', borderRadius: '10px', padding: '0.5rem 1.25rem', fontSize: '0.9rem', color: '#64748b', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500 }}>
                                <Building2 size={16} className="text-blue-500" /> hireme.ai/recruiter/mailing-system
                            </div>
                            <button onClick={() => setShowEmailModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', transition: 'color 0.2s' }}>
                                <XCircle size={26} />
                            </button>
                        </div>

                        {/* Email Body */}
                        <div style={{ padding: '2.5rem' }}>
                            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 8px 16px -4px rgba(0,0,0,0.05)' }}>
                                <div style={{ padding: '1.75rem', background: 'linear-gradient(135deg, #1e40af, #2563eb)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '45px', height: '45px', background: 'rgba(255,255,255,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                                            <Mail size={22} color="white" />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Selection Confirmation</h3>
                                            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.85, fontWeight: 500 }}>Branded Automated Communication</p>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: 600 }}>PRIORITY: HIGH</div>
                                </div>

                                <div style={{ padding: '3rem', whiteSpace: 'pre-line', color: '#1e293b', fontSize: '1.05rem', lineHeight: 1.9, maxHeight: '450px', overflowY: 'auto', background: 'linear-gradient(to bottom, #ffffff, #f1f5f9)', scrollbarWidth: 'thin' }}>
                                    {generatedEmail.content}
                                </div>

                                <div style={{ padding: '1.75rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
                                        <Activity size={18} /> Verified by HireMe AI
                                    </div>
                                    <button
                                        onClick={() => setShowEmailModal(false)}
                                        style={{ padding: '0.75rem 2rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)', transition: 'transform 0.2s' }}
                                    >
                                        Confirm & Close
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginTop: '2rem' }}>
                                <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>Recipient: <b style={{ color: '#475569' }}>{generatedEmail.candidate}</b></div>
                                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#cbd5e1' }}></div>
                                <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>System: <b style={{ color: '#475569' }}>HireMe Smart-Recruiter v2</b></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .modal-label { display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem; }
                .modal-input { box-sizing: border-box; padding: 0.6rem 0.75rem; border-radius: 6px; border: 1px solid #cbd5e1; outline: none; font-size: 0.95rem; font-family: inherit; width: 100%; transition: all 0.2s }
                .modal-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
            `}</style>
        </div>
    );
}

export default RecruiterDashboard;
