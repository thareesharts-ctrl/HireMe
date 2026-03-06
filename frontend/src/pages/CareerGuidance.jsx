import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';
import { Download, Compass, Loader2, ArrowLeft, Layers } from 'lucide-react';
import '../App.css';

function CareerGuidance() {
    const navigate = useNavigate();
    const [selectedDomain, setSelectedDomain] = useState('');
    const [roadmap, setRoadmap] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const roadmapRef = useRef(null);

    const domains = [
        'Full Stack Development',
        'Data Science',
        'Data Analytics',
        'Cloud Computing',
        'Cyber Security',
        'Mobile App Development',
        'Artificial Intelligence and Machine Learning'
    ];

    const generateRoadmap = async () => {
        if (!selectedDomain) return;

        setIsLoading(true);
        setRoadmap('');

        try {
            const response = await axios.post('http://localhost:5000/api/generate-roadmap', {
                domain: selectedDomain
            });

            if (response.data && response.data.success) {
                setRoadmap(response.data.roadmap);
            } else {
                throw new Error("Failed to generate roadmap.");
            }
        } catch (error) {
            console.error(error);
            alert("Error generating the roadmap. Please ensure the backend is running and the API key is valid.");
        } finally {
            setIsLoading(false);
        }
    };

    const downloadPDF = () => {
        if (!roadmapRef.current) return;

        const element = roadmapRef.current;
        const opt = {
            margin: [15, 15, 15, 15],
            filename: `${selectedDomain.replace(/\s+/g, '_')}_Career_Blueprint.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                letterRendering: true,
                scrollY: 0,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['css', 'legacy'] }
        };

        // Promise-based generation
        html2pdf().set(opt).from(element).save();
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: '3rem' }}>

            <nav style={{ background: 'white', padding: '1rem 2rem', display: 'flex', alignItems: 'center', borderBottom: '1px solid #e2e8f0', sticky: 'top', zIndex: 10 }}>
                <button onClick={() => navigate('/applier')} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }} className="hover:text-blue-600 transition-colors">
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>
            </nav>

            <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '3rem' }}>
                <div style={{ background: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', width: '100%', maxWidth: '800px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>

                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <div style={{ background: '#fdf4ff', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#ec4899' }}>
                            <Compass size={32} />
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Full Career Blueprint</h1>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                            Generate an authoritative, 1000-word professional roadmap including market insights, salary benchmarks, and FAANG-level interview preparation.
                        </p>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Select Professional Domain</label>
                        <select
                            value={selectedDomain}
                            onChange={(e) => setSelectedDomain(e.target.value)}
                            style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '8px', border: '2px solid #cbd5e1', fontSize: '1rem', outline: 'none', transition: 'border 0.2s', cursor: 'pointer' }}
                        >
                            <option value="" disabled>-- Choose a Tech Stack --</option>
                            {domains.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        className="btn-primary"
                        disabled={!selectedDomain || isLoading}
                        onClick={generateRoadmap}
                        style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', opacity: (!selectedDomain || isLoading) ? 0.6 : 1 }}
                    >
                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Layers size={20} />}
                        {isLoading ? 'Architecting your blueprint...' : 'Generate Complete Road-Map'}
                    </button>

                </div>

                {/* Render Roadmap Result directly in the view */}
                {roadmap && (
                    <div className="fade-in-up" style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div
                            ref={roadmapRef}
                            style={{
                                background: 'white',
                                padding: '3rem',
                                borderRadius: '16px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                fontSize: '1.05rem',
                                color: '#334155',
                                lineHeight: '1.7'
                            }}
                            className="markdown-body"
                        >
                            {/* Title injected specifically for the PDF render */}
                            <div style={{ display: 'inline-block', padding: '0.4rem 1rem', background: '#fdf4ff', color: '#ec4899', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Professional Career Blueprint
                            </div>
                            <h1 style={{ color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '2rem', fontSize: '2.25rem', fontWeight: 800 }}>
                                {selectedDomain}
                            </h1>
                            <ReactMarkdown>{roadmap}</ReactMarkdown>
                        </div>

                        <button
                            className="btn-primary"
                            onClick={downloadPDF}
                            style={{ alignSelf: 'center', padding: '1rem 2rem', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0f172a' }}
                        >
                            <Download size={20} /> Download as PDF
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

export default CareerGuidance;
