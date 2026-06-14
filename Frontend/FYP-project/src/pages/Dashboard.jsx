// src/pages/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './Dashboard.module.css'; 
import AppShell from '../components/AppShell'; 



import akmalPic from '../assets/akmal.jpg';
import talalPic from '../assets/talal.jpg';

// --- Icons ---
const Mic = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>);
const VolumeX = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>);
const Volume2 = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>);

// =========================================================
// AUTOPLAY 3D CAROUSEL (Clickable)
// =========================================================
const UseCaseCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(1);
    
    const cards = [
        { 
            title: 'Students', 
            desc: 'Easily transcribe long lectures and clean up noisy recordings from the classroom.',
            img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=400&auto=format&fit=crop'
        },
        { 
            title: 'Content Creators', 
            desc: 'Enhance your podcast or YouTube audio to sound like it was recorded in a studio.',
            img: 'https://images.unsplash.com/photo-1598550880863-4e8aa3d0edb4?q=80&w=400&auto=format&fit=crop'
        },
        { 
            title: 'Businesses', 
            desc: 'Automate voice tasks, analyze customer sentiment, and transcribe meeting notes.',
            img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=400&auto=format&fit=crop'
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
        }, 3000);
        return () => clearInterval(timer);
    }, [cards.length]);

    return (
        <div className={styles.carouselWrapper}>
            <div className={styles.carousel}>
                {cards.map((card, index) => {
                    let positionClass = '';
                    const lastIndex = cards.length - 1;
                    let prevIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
                    let nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;

                    if (index === currentIndex) positionClass = styles.active;
                    else if (index === prevIndex) positionClass = styles.prevCard;
                    else if (index === nextIndex) positionClass = styles.nextCard;

                    return (
                        <div 
                            key={index} 
                            className={`${styles.carouselCard} ${positionClass}`}
                            onClick={() => setCurrentIndex(index)} 
                        >
                            <img src={card.img} alt={card.title} />
                            <div className={styles.carouselCardInfo}>
                                <h3>{card.title}</h3>
                                <p>{card.desc}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// =========================================================
// 3D DEVELOPER CARD COMPONENT 
// =========================================================
const DeveloperCard = ({ name, imageUrl }) => {
    const cardRef = useRef(null);
    const glareRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!cardRef.current || !glareRef.current) return;
        const card = cardRef.current;
        const glare = glareRef.current;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; 
        const y = e.clientY - rect.top;  
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -15; 
        const rotateY = ((x - centerX) / centerX) * 15;
        
        card.style.transform = `perspective(1500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(30px)`;
        card.style.transition = 'none'; 
        
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;
        glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(0, 255, 255, 0.4) 0%, rgba(0, 255, 255, 0) 60%)`;
        glare.style.opacity = '1';
    };

    const handleMouseLeave = () => {
        if (!cardRef.current || !glareRef.current) return;
        cardRef.current.style.transform = `perspective(1500px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
        cardRef.current.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease';
        glareRef.current.style.opacity = '0';
    };

    return (
        <div className={styles.devCardContainer} ref={cardRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            <div className={styles.devCardContent}>
                <div className={styles.devImageWrapper}>
                    <img src={imageUrl} alt={name} className={styles.devProfileImgCircle} />
                </div>
                <div className={styles.devCardBadgesBelow}>
                    <div className={`${styles.devBadge} ${styles.devNameBadge}`}>{name}</div>
                </div>
                <div ref={glareRef} className={styles.devGlare}></div>
            </div>
        </div>
    );
};

// =========================================================
// MAIN DASHBOARD
// =========================================================
export default function Dashboard() {
    const [vantaEffect, setVantaEffect] = useState(null);
    const vantaRef = useRef(null);
    const dashboardBgRef = useRef(null); 

    const handleGlobalMouseMove = (e) => {
        if (!dashboardBgRef.current) return;
        const rect = dashboardBgRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        dashboardBgRef.current.style.setProperty('--mouse-x', `${x}%`);
        dashboardBgRef.current.style.setProperty('--mouse-y', `${y}%`);
    };

    useEffect(() => {
        if (!vantaEffect && vantaRef.current && window.VANTA) {
            setVantaEffect(window.VANTA.DOTS({
                el: vantaRef.current,
                mouseControls: true,
                touchControls: true,
                gyroControls: false,
                minHeight: 200.00,
                minWidth: 200.00,
                scale: 1.00,
                scaleMobile: 1.00,
                color: 0x20e8ff,
                color2: 0x20fffa,
                size: 7.60,
                spacing: 71.00,
                showLines: true,
                backgroundColor: 0x07070a 
            }));
        }
        return () => {
            if (vantaEffect) vantaEffect.destroy();
        };
    }, [vantaEffect]);

    const features = [
        { name: 'Voice-to-Text (VTT)', description: 'Transcribe your audio files into accurate, editable text, supporting multiple languages.', icon: '✍️', link: '/voice/voice-to-text' },
        { name: 'Text-to-Voice (TTS)', description: 'Generate natural-sounding speech from any text input, useful for narration and messaging.', icon: '🗣️', link: '/voice/text-to-voice' },
        { name: 'Voice Enhancement', description: 'Automatically adjust equalization, loudness, and dynamics to make speech sound professional.', icon: '✨', link: '/voice/enhancement' },
        { name: 'Noise Reduction', description: 'Remove unwanted background noise, static, and hum from your recordings for crystal-clear audio.', icon: '🤫', link: '/voice/noise-reduction' },
        { name: 'Emotion Detection', description: 'Analyze the tone of voice in your audio to detect underlying emotional states like joy, anger, or sadness.', icon: '😊', link: '/voice/emotion-detection' },
    ];

    const howItWorksCards = [
        { id: 1, title: '1. Upload Audio', desc: 'Record directly or upload your MP3/WAV files to the platform.', btnText: 'Go to Workspace', themeClass: styles.premiumCard1, btnClass: styles.premiumBtn1, img: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600&auto=format&fit=crop', link: '/voice' },
        { id: 2, title: '2. Choose Feature', desc: 'Select noise reduction, transcription, or enhancement.', btnText: 'Explore Features', themeClass: styles.premiumCard2, btnClass: styles.premiumBtn2, img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop', link: '/voice' },
        { id: 3, title: '3. Download Result', desc: 'Get your professional-grade results in seconds.', btnText: 'Open Voice Hub', themeClass: styles.premiumCard3, btnClass: styles.premiumBtn3, img: 'https://images.unsplash.com/photo-1633412802994-5c058f151b66?q=80&w=600&auto=format&fit=crop', link: '/voice' }
    ];

    return (
        <AppShell> 
            <div 
                className={styles.dynamicBackgroundWrapper} 
                ref={dashboardBgRef} 
                onMouseMove={handleGlobalMouseMove}
            >
                <div className={styles.dashboardContainer}>
                    
                    <div ref={vantaRef} className={styles.vantaHeroWrapper}>
                        <header className={styles.heroHeader}>
                            <h1 className={styles.welcomeTitle}>
                                {"WELCOME".split("").map((letter, index) => (
                                    <span 
                                        key={index} 
                                        className={styles.animatedLetter} 
                                        style={{ animationDelay: `${index * 0.15}s` }} 
                                    >
                                        {letter}
                                    </span>
                                ))}
                            </h1>
                            <p className={styles.subtitleText}>
                                Your professional command center to transform, clean, and analyze audio with studio-grade artificial intelligence.
                            </p>
                        </header>
                    </div>

                    <section className={styles.sectionWrapper}>
                        <h2 className={styles.sectionTitleCenter}>Powerful Audio AI Tools</h2>
                        <div className={styles.featureCardsGrid}>
                            {features.map((feature) => (
                                <Link key={feature.name} to={feature.link} className={styles.animatedFeatureCard}>
                                    <div className={styles.animatedCardInner}>
                                        <div className={styles.featureIconWrapper}>
                                            <div className={styles.featureIcon}>{feature.icon}</div>
                                        </div>
                                        <h3 className={styles.cardTitle}>{feature.name}</h3>
                                        <p className={styles.cardDescription}>{feature.description}</p>
                                        <span className={styles.cardCta}>Start Processing →</span>
                                    </div>
                                    <div className={styles.animatedGlowBorder}></div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    <div className={styles.sectionSeparator}></div>

                    <section className={styles.sectionWrapper}>
                        <h2 className={styles.sectionTitleCenter}>How It Works</h2>
                        <div className={styles.premiumCardsGrid}>
                            {howItWorksCards.map((card) => (
                                <div key={card.id} className={`${styles.premiumCard} ${card.themeClass}`}>
                                    <div className={styles.premiumCardContent}>
                                        <h3 className={styles.premiumCardTitle}>{card.title}</h3>
                                        <p className={styles.premiumCardDesc}>{card.desc}</p>
                                        <Link to={card.link} className={`${styles.premiumCardBtn} ${card.btnClass}`} style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>
                                            {card.btnText}
                                        </Link>
                                    </div>
                                    <img src={card.img} alt={card.title} className={styles.premiumCardImg} />
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className={styles.sectionSeparator}></div>

                    <section className={styles.sectionWrapper}>
                        <h2 className={styles.sectionTitleCenter}>Who is this for?</h2>
                        <UseCaseCarousel />
                    </section>

                    <div className={styles.sectionSeparator}></div>

                    <section className={styles.sectionWrapper}>
                        <h2 className={styles.sectionTitleCenter}>Hear the Difference</h2>
                        <div className={styles.comparisonContainer}>
                            <div className={styles.compareBox}>
                                <div className={styles.compareHeader}>
                                    <VolumeX className={styles.compareIconRed} />
                                    <h3>Before</h3>
                                </div>
                                <div className={styles.waveformRed}></div>
                                <p className={styles.compareText}>Background noise, echo, and low clarity.</p>
                            </div>
                            <div className={styles.compareDivider}>→</div>
                            <div className={styles.compareBox}>
                                <div className={styles.compareHeader}>
                                    <Volume2 className={styles.compareIconCyan} />
                                    <h3>After</h3>
                                </div>
                                <div className={styles.waveformCyan}></div>
                                <p className={styles.compareText}>Crystal clear, professional studio quality.</p>
                            </div>
                        </div>
                    </section>

                    <div className={styles.sectionSeparator}></div>

                    <section className={styles.sectionWrapper}>
                        <div className={styles.devHeadingBox}>
                            <h2 className={styles.devMainHeading}>DEVELOPERS</h2>
                        </div>
                        <div className={styles.devGrid}>
                            <DeveloperCard name="TALAL"  imageUrl={talalPic} />
                            <DeveloperCard name="AKMAL"  imageUrl={akmalPic} />
                        </div>
                    </section>

                    <section className={styles.ctaSection}>
                        <h2 className={styles.ctaTitle}>Ready to transform your audio?</h2>
                        <p className={styles.ctaSubtitle}>Start your first job right now. No setup required.</p>
                        <Link to="/voice" className={styles.primaryButtonCTA}>
                            <Mic className={styles.iconSmall} /> Go to Voice Hub
                        </Link>
                    </section>

                </div>
            </div>
        </AppShell>
    );
}