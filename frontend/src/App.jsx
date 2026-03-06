import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import ApplierDashboard from './pages/ApplierDashboard';
import ResumeScanner from './pages/ResumeScanner';
import ModelMockTest from './pages/ModelMockTest';
import RecruiterDashboard from './pages/RecruiterDashboard';
import CareerGuidance from './pages/CareerGuidance';
import AIAssistantInterview from './pages/AIAssistantInterview';
import JobAssessment from './pages/JobAssessment';
import ChatAssistant from './ChatAssistant';
import './App.css';

const GlobalChat = () => {
  const location = useLocation();
  // We hide the chat bot on the login/register paths and test assessment pages to prevent cheating
  const hiddenPaths = ['/login', '/register', '/applier/mock', '/applier/scanner', '/applier/assistant-interview'];

  if (hiddenPaths.includes(location.pathname) || location.pathname.startsWith('/applier/assessment')) {
    return null;
  }
  return <ChatAssistant />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />
        <Route path="/applier" element={<ApplierDashboard />} />
        <Route path="/applier/scanner" element={<ResumeScanner />} />
        <Route path="/applier/mock" element={<ModelMockTest />} />
        <Route path="/applier/guidance" element={<CareerGuidance />} />
        <Route path="/applier/assistant-interview" element={<AIAssistantInterview />} />
        <Route path="/applier/assessment/:jobId" element={<JobAssessment />} />
        <Route path="/recruiter" element={<RecruiterDashboard />} />
      </Routes>
      <GlobalChat />
    </Router>
  );
}

export default App;
