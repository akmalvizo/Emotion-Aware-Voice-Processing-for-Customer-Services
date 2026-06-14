// src/pages/Voice/VoiceHub.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import styles from './VoiceHub.module.css'; // <-- Added strict CSS module import

/**
 * The Voice Hub index page, listing all available voice processing features.
 */
export default function VoiceHub() {

  // 🚨 STRICTLY ORDERED: VTT, TTV, VE, NR, ED 🚨
  const voiceFeatures = [
    { 
      name: 'Voice-to-Text (VTT)', 
      description: 'Transcribe your audio files into accurate, editable text, supporting multiple languages.', 
      icon: '✍️', 
      link: '/voice/voice-to-text'
    },
    { 
      name: 'Text-to-Voice (TTS)', 
      description: 'Generate natural-sounding speech from any text input, useful for narration and messaging.', 
      icon: '🗣️', 
      link: '/voice/text-to-voice'
    },
    { 
      name: 'Voice Enhancement', 
      description: 'Automatically adjust equalization, loudness, and dynamics to make speech sound professional.', 
      icon: '✨', 
      link: '/voice/enhancement'
    },
    { 
      name: 'Noise Reduction', 
      description: 'Remove unwanted background noise, static, and hum from your recordings for crystal-clear audio.', 
      icon: '🤫', 
      link: '/voice/noise-reduction'
    },
    { 
      name: 'Emotion Detection', 
      description: 'Analyze the tone of voice in your audio to detect underlying emotional states like joy, anger, or sadness.', 
      icon: '😊', 
      link: '/voice/emotion-detection'
    }
  ];

  return (
    <AppShell>
      <div className={styles.voiceHubLayout}>
        <header className={styles.voiceHubHeader}>
          <h1 className={styles.mainTitle}>Voice Processing Hub</h1>
          <p className={styles.subtitleText}>
            Select a feature to begin transforming your audio or generating new voice content.
          </p>
        </header>

        <section className={styles.featureCardsGrid}>
          {voiceFeatures.map((feature) => (
            <Link key={feature.name} to={feature.link} className={styles.featureCard}>
              <div className={styles.featureIconWrapper}>
                <div className={styles.featureIcon}>{feature.icon}</div>
              </div>
              <h3 className={styles.cardTitle}>{feature.name}</h3>
              <p className={styles.cardDescription}>{feature.description}</p>
              <span className={styles.cardCta}>Start Processing →</span>
            </Link>
          ))}
        </section>
        
        <aside className={styles.hubNote}>
            <p className={styles.noteText}>
                Note: All processing is subject to your current usage limits and retention settings 
                (currently set to 30 days retention). Check your <Link to="/profile" className={styles.linkText}>Profile</Link> for details.
            </p>
        </aside>

      </div>
    </AppShell>
  );
}