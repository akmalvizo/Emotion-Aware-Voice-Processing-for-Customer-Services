import React, { useContext, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, Button, Box, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
// REMOVED: import { motion } from 'framer-motion'; ❌
import { FaMicrophoneAlt, FaMagic, FaVolumeUp, FaFileAlt, FaSmile, FaTools, FaTwitter, FaLinkedinIn, FaGithub } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import './homepage.css'; // Assuming this file exists and contains the CSS below


// Dummy context for demonstration
const AuthContext = React.createContext({ isAdmin: false });

// Feature data with icons
const features = [
    { title: 'Noise Reduction', path: '/noise-reduction', desc: 'Remove background noise for crystal-clear audio.', Icon: FaMicrophoneAlt },
    { title: 'Voice Enhancer', path: '/voice-enhancer', desc: 'Boost clarity and presence to make voices stand out.', Icon: FaMagic },
    { title: 'Voice to Text', path: '/voice-to-text', desc: 'Accurately transcribe speech to text in real-time.', Icon: FaFileAlt },
    { title: 'Text to Voice', path: '/text-to-voice', desc: 'Generate natural-sounding voiceovers from any text input.', Icon: FaVolumeUp },
    { title: 'Emotion Detection', path: '/emotion-detection', desc: 'Analyze and categorize emotional tone in spoken words.', Icon: FaSmile },
    
];

// Feature Card Component
const FeatureCard = ({ feature, navigate, index }) => (
    <Grid item xs={12} sm={6} md={4} 
        // Apply class for CSS-based fade-in on scroll
        className="scroll-fade-item"
        // Apply inline style for staggered delay
        style={{ '--animation-delay': `${index * 0.1}s` }}
    >
        <div className="feature-card-wrapper"> {/* Class for hover lift and neon border, handled by CSS */}
            <Card className="feature-card-content">
                <CardContent sx={{ textAlign: 'center' }}>
                    <Box className="card-icon-wrapper" sx={{ color: '#7b2ff7', mb: 1 }}>
                        <feature.Icon size={40} />
                    </Box>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 700, mb: 0.5, color: '#fcfcfc' }}>
                        {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ height: 40, color: '#ccc' }}>
                        {feature.desc}
                    </Typography>
                    <div className="button-hover-effect"> {/* CSS-based button hover effect */}
                        <Button
                            variant="contained"
                            className="gradient-button"
                            onClick={() => navigate(feature.path)}
                            sx={{ mt: 2, borderRadius: '12px' }}
                        >
                            Explore <FiExternalLink style={{ marginLeft: '8px' }} />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    </Grid>
);


// Main Component
const HomePage = () => {
    const navigate = useNavigate();
    const { isAdmin } = useContext(AuthContext);

    // --- Native Scroll Intersection Observer for Fade-in Effect ---
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-visible');
                    // Stop observing once visible to run the animation only once
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 }); // 10% of item must be visible

        // Select all elements that need the scroll fade effect
        document.querySelectorAll('.scroll-fade-section, .scroll-fade-item').forEach(el => {
            observer.observe(el);
        });

        // Cleanup
        return () => observer.disconnect();
    }, []);

    // Function to create a section component with scroll-fade
    const ScrollFadeSection = ({ children, className = '' }) => (
        <div
            className={`section-padding scroll-fade-section ${className}`}
        >
            {children}
        </div>
    );

    return (
        <Box className="home-page-root">
            {/* 1. Hero Section - Initial load fade-in uses CSS class */}
            <Box className="hero-section">
                <Container maxWidth="lg" sx={{ textAlign: 'center', py: 12, }}>
                    <div className="hero-fade-in"> {/* Class for initial load animation */}
                        <Typography variant="h2" component="h1" className="gradient-text hero-title" sx={{ fontWeight: 900, mb: 1 }}>
                            <span className="typing-text">Unleash Your Audio Superpowers.</span>
                        </Typography>
                        <Typography variant="h5" sx={{ color: '#b0b3b8', mb: 4, maxWidth: 800, mx: 'auto' }}>
                            The all-in-one platform for professional-grade audio processing, powered by AI.
                        </Typography>
                        <div className="pulse-effect">
                            <Button
                                variant="contained"
                                className="gradient-button"
                                size="large"
                                onClick={() => navigate('/signup')}
                                sx={{ borderRadius: '16px', py: 1.5, px: 4 }}
                            >
                                Start Free Now
                            </Button>
                        </div>
                    </div>
                </Container>
            </Box>

            {/* --- Section Separator --- */}
            <div className="section-separator"></div>

            {/* 2. Feature Cards Section (Main Grid Area) */}
            <ScrollFadeSection className="feature-section">
                <Container maxWidth="lg">
                    <Typography variant="h3" className="section-heading" sx={{ textAlign: 'center', mb: 6 }}>
                        Core AI Features
                    </Typography>
                    <Grid container spacing={4}>
                        {features.map((feature, index) => (
                            // Pass index for stagger effect via CSS variable
                            <FeatureCard key={feature.title} feature={feature} navigate={navigate} index={index} /> 
                        ))}
                    </Grid>
                </Container>
            </ScrollFadeSection>

            {/* 3. About / Info Section */}
            <ScrollFadeSection className="about-section">
                <Container maxWidth="md" sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" className="section-heading" sx={{ mb: 2 }}>
                        A New Era of Audio Editing
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#ccc', mb: 3 }}>
                        Our platform provides powerful, easy-to-use tools that leverage advanced machine learning models. Whether you're a podcaster, musician, or developer, we provide the precision you need without the steep learning curve.
                    </Typography>
                    <Button variant="outlined" className="gradient-border-button" onClick={() => navigate('/about')}>
                        Learn More
                    </Button>
                </Container>
            </ScrollFadeSection>
            
            {/* 4. Call to Action - "Start Now" */}
            <ScrollFadeSection className="cta-section">
                <Container maxWidth="lg" sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h3" className="section-heading" sx={{ mb: 2 }}>
                        Ready to Amplify Your Sound?
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#b0b3b8', mb: 4 }}>
                        Access all features with a free 7-day trial. No credit card required.
                    </Typography>
                    <div className="pulse-effect">
                        <Button
                            variant="contained"
                            className="gradient-button"
                            size="large"
                            onClick={() => navigate('/register')}
                            sx={{ borderRadius: '16px', py: 1.5, px: 6 }}
                        >
                            Try Features Today
                        </Button>
                    </div>
                </Container>
            </ScrollFadeSection>

           

            {/* Admin Button */}
            {isAdmin && (
                <Button variant="outlined" className="gradient-border-button" onClick={() => navigate('/admin/dashboard')} sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 100 }}>
                    Admin Dashboard
                </Button>
            )}
        </Box>

    );
};

export default HomePage;