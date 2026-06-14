// src/pages/About.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import styles from './About.module.css';

// --- Icons (Mapped precisely to the stylesheet) ---
const Cpu = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>);
const Waves = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>);
const MessageSquare = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>);
const Smile = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>);
const Sparkles = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M3 12h18M5.5 5.5l13 13M18.5 5.5l-13 13"/></svg>);
const Volume2 = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>);
const ArrowRight = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>);

export default function About() {
  return (
    <AppShell>
      <div className={styles.aboutContainer}>
        
        {/* --- HERO HEADER --- */}
        <header className={styles.heroHeader}>
          <div className={styles.badge}>Architecture Overview</div>
          <h1 className={styles.mainTitle}>Voice Reimagined</h1>
          <p className={styles.subtitleText}>
            An advanced, intelligent workspace leveraging deep learning frameworks to clean, synthesize, transcribe, and decode acoustic telemetry seamlessly.
          </p>
        </header>

        {/* --- VISION SECTION --- */}
        <section className={styles.visionSection}>
          <div className={styles.visionCard}>
            <div className={styles.visionIconWrapper}>
              <Cpu className={styles.iconLarge} />
            </div>
            <div className={styles.visionContent}>
              <h2 className={styles.sectionTitle}>The VoiceLab System</h2>
              <p className={styles.visionText}>
                VoiceLab is engineered to solve core multimedia processing constraints by bridging the gap between heavy AI execution and web interface optimization. Harnessing native browser hardware streams alongside <strong>Deep Learning inference</strong>, the application turns raw audio data arrays into structured insights.
              </p>
              <p className={styles.visionText}>
                The frontend is built on a clean component lifecycle architecture using React and Vite, while the pipeline layer interacts natively with powerful mathematical models. From removing persistent audio frequency hums to multi-class human tone classification via custom feature engineering, every workflow is fine-tuned for high-speed responsiveness.
              </p>
            </div>
          </div>
        </section>

        <div className={styles.sectionSeparator}></div>

        {/* --- CORE TECHNOLOGIES GRID --- */}
        <section className={styles.techSection}>
          <h2 className={styles.sectionTitleCenter}>Core AI Engines</h2>
          <p className={styles.techSubtitle}>The machine learning structures powering our processing matrix.</p>
          
          <div className={styles.techGrid}>
            
            {/* 1. Text-to-Voice */}
            <div className={styles.techCard}>
              <div className={styles.techIconWrapper}>
                <Volume2 className={styles.techIcon} />
              </div>
              <h3 className={styles.techCardTitle}>Neural Text-to-Voice</h3>
              <p className={styles.techCardDesc}>
                Synthesizes written string formats into highly articulated, human-like verbal waves using modern acoustic vocal modeling pipelines.
              </p>
            </div>

            {/* 2. Voice-to-Text */}
            <div className={styles.techCard}>
              <div className={styles.techIconWrapper}>
                <MessageSquare className={styles.techIcon} />
              </div>
              <h3 className={styles.techCardTitle}>Voice-to-Text</h3>
              <p className={styles.techCardDesc}>
                Leverages advanced <strong>Transformer models</strong> and Automatic Speech Recognition (ASR) pipelines for highly accurate, low-latency transcription.
              </p>
            </div>

            {/* 3. Noise Reduction */}
            <div className={styles.techCard}>
              <div className={styles.techIconWrapper}>
                <Waves className={styles.techIcon} />
              </div>
              <h3 className={styles.techCardTitle}>Noise Reduction</h3>
              <p className={styles.techCardDesc}>
                Utilizes Convolutional Neural Networks (CNNs) trained on millions of hours of audio to instantly distinguish human speech from complex static.
              </p>
            </div>

            {/* 4. Emotion Detection */}
            <div className={styles.techCard}>
              <div className={styles.techIconWrapper}>
                <Smile className={styles.techIcon} />
              </div>
              <h3 className={styles.techCardTitle}>Emotion Detection</h3>
              <p className={styles.techCardDesc}>
                Uses specialized spectrogram analysis to map vocal pitch, tone, and tempo variations to quantify complex human emotional states accurately.
              </p>
            </div>

            {/* 5. Voice Enhancement */}
            <div className={styles.techCard}>
              <div className={styles.techIconWrapper}>
                <Sparkles className={styles.techIcon} />
              </div>
              <h3 className={styles.techCardTitle}>Voice Enhancement</h3>
              <p className={styles.techCardDesc}>
                Applies dynamic equalization and <strong>LUFS normalization</strong> algorithms to ensure your audio output meets professional broadcasting standards.
              </p>
            </div>

          </div>
        </section>

        {/* --- FINAL CTA --- */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaGlow}></div>
          <h2 className={styles.ctaTitle}>Ready to Transform Your Audio?</h2>
          <p className={styles.ctaSubtitle}>
            Experience the future of AI-powered voice processing directly in your browser with our integrated workspace dashboard.
          </p>
          <Link to="/dashboard" className={styles.primaryButtonCTA}>
            Start Your Journey <ArrowRight className={styles.iconSmall} />
          </Link>
        </section>

      </div>
    </AppShell>
  );
}