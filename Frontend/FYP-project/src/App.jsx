import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';

// --- PUBLIC PAGES ---
import About from './pages/About'; 
import PrivacyPolicy from './pages/PrivacyPolicy';
import NotFound from './pages/NotFound';

// --- USER CORE PAGES ---
import Dashboard from './pages/Dashboard';

// --- VOICE FEATURES ---
import VoiceHub from './pages/Voice/VoiceHub';
import NoiseReduction from './pages/Voice/NoiseReduction';
import VoiceToText from './pages/Voice/VoiceToText';
import VoiceEnhancement from './pages/Voice/VoiceEnhancement';
import TextToVoice from './pages/Voice/TextToVoice';
import EmotionDetection from './pages/Voice/EmotionDetection';

function AppRoutes() {
    return (
        <Routes>
            {/* --- ROOT REDIRECT TO DASHBOARD --- */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* --- CORE PAGES --- */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/about" element={<About />} /> 
            <Route path="/privacy" element={<PrivacyPolicy />} />

            {/* --- NESTED VOICE FEATURES ROUTES --- */}
            <Route path="/voice" element={<Outlet />}>
                <Route index element={<VoiceHub />} />
                <Route path="noise-reduction" element={<NoiseReduction />} />
                <Route path="voice-to-text" element={<VoiceToText />} />
                <Route path="enhancement" element={<VoiceEnhancement />} />
                <Route path="text-to-voice" element={<TextToVoice />} />
                <Route path="emotion-detection" element={<EmotionDetection />} />
            </Route>

            {/* --- 404 FALLBACK ROUTE --- */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}


export default function App() {
    return (
        <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
            <AppRoutes /> 
        </Router>
    );
}