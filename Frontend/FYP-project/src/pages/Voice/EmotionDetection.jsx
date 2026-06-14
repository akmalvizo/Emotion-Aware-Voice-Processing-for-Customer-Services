// src/pages/Voice/EmotionDetection.jsx
import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom'; 
import AppShell from '../../components/AppShell'; 
import styles from './EmotionDetection.module.css'; 
import axios from 'axios'; 
// Added CartesianGrid to Recharts import for the background radar lines
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, CartesianGrid } from 'recharts';

// ----------------------------------------------------------------------
// CONSTANTS & HELPERS
// ----------------------------------------------------------------------
const MAX_FILE_SIZE_MB = 5; 
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const EMOTION_CLASS_MAP = {
    Angry: 'theme-anger',
    Fear: 'theme-fear',
    Happy: 'theme-joy',
    Neutral: 'theme-neutral',
    Sad: 'theme-sadness',
};

const getEmotionClass = (emotion) => EMOTION_CLASS_MAP[emotion] || EMOTION_CLASS_MAP['Neutral'];

const getEmotionInsight = (emotion) => {
    const insights = {
        Happy: "Positive tone with energetic expression indicating joy or happy.",
        Neutral: "Balanced and steady vocal pattern indicating neutral.",
        Angry: "High intensity and sharp vocal patterns suggest frustration or angry.",
        Sad: "Low energy with a softer tone indicating grief or sadness.",
        Fear: "Unstable tone indicating signs of tension or fear."
    };
    return insights[emotion] || insights['Neutral'];
};

// --- CYBERPUNK CHART HELPERS ---
// Formatting to match the exact 1-to-5 sequential layout in the image
const formatChartData = (scores) => {
    if (!scores) return [];
    return [
        { name: 'Angry', value: scores.Angry || 0 }, 
        { name: 'Fear', value: scores.Fear || 0 },   
        { name: 'Happy', value: scores.Happy || 0 }, 
        { name: 'Neutral', value: scores.Neutral || 0 }, 
        { name: 'Sad', value: scores.Sad || 0 },     
    ];
};

// Custom X-Axis Labels (Bottom Text)
const CustomXAxisTick = ({ x, y, payload }) => {
    return (
        <text x={x} y={y + 15} fill="#ffffff" fontSize={14} fontWeight="700" textAnchor="middle" style={{ textShadow: '0 0 5px rgba(0, 255, 255, 0.5)' }}>
            {payload.value}
        </text>
    );
};

// Custom Bar Labels (Floating Percentages above bars)
const CustomTopLabel = (props) => {
    const { x, y, width, value } = props;
    return (
        <text x={x + width / 2} y={y - 12} fill="#00FFFF" fontSize={18} fontWeight="800" textAnchor="middle">
            {value}%
        </text>
    );
};

// --- ICONS ---
const IconBase = ({ children, className, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>{children}</svg>
);
const Upload = (props) => (<IconBase {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></IconBase>);
const RefreshCw = (props) => (<IconBase {...props}><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></IconBase>);
const AlertCircle = (props) => (<IconBase {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></IconBase>);
const ArrowLeft = (props) => (<IconBase {...props}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></IconBase>);
const Check = (props) => (<IconBase {...props}><polyline points="20 6 9 17 4 12"/></IconBase>);
const Activity = (props) => (<IconBase {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></IconBase>);
const Sparkles = (props) => (<IconBase {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></IconBase>);
const Shield = (props) => (<IconBase {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></IconBase>);

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------
export default function EmotionDetection() {
    const [status, setStatus] = useState('idle'); 
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    
    const fileInputRef = useRef(null);

    const processAudio = useCallback(async (file) => {
        setError(null);
        setResult(null);
        setStatus('analyzing');

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/emotion-detection",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            setResult({
                dominant: response.data.emotion,
                confidence: response.data.confidence,
                all_scores: response.data.all_scores, 
                insight: getEmotionInsight(response.data.emotion),
                summary: "AI detected emotion from voice using deep learning model."
            });

            setStatus("success");

        } catch (err) {
            console.error(err);
            setError("Backend connection failed. Check server.");
            setStatus("idle");
        }
    }, []);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        setError(null); 
        
        if (!file) return;

        const ext = file.name.split('.').pop().toLowerCase();
        if (ext !== 'mp3' && ext !== 'wav') {
            setError("Only MP3 and WAV formats are allowed for upload.");
            e.target.value = null;
            return;
        }

        if (file.size > MAX_FILE_SIZE_BYTES) { 
            setError(`File too large. Max allowed size is ${MAX_FILE_SIZE_MB}MB.`);
            e.target.value = null; 
            return;
        }
        
        processAudio(file);
        e.target.value = null; 
    };

    const resetAnalysis = () => {
        setResult(null);
        setError(null);
        setStatus('idle');
    };

    const renderIdleState = () => (
        <div className={styles.idleContainer}>
            <button onClick={() => fileInputRef.current?.click()} className={styles.uploadCard}>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className={styles.hiddenInput} 
                    onChange={handleFileUpload} 
                    accept=".mp3,.wav,audio/mpeg,audio/wav" 
                />
                <div className={styles.uploadIconWrapper}>
                    <Upload className={styles.iconLarge} />
                </div>
                <span className={styles.cardTitle}>Upload Audio File</span>
                <span className={styles.cardSubtitle}>Drag and drop or click to browse</span>
                <span className={styles.cardInfo}>Supported formats: MP3, WAV (Max {MAX_FILE_SIZE_MB}MB)</span>
            </button>
        </div>
    );

    const renderProcessingState = () => (
        <div className={styles.processingState}>
            <div className={styles.spinner}></div>
            <h4 className={styles.processingTitle}>Analyzing Acoustic Profile...</h4>
            <p className={styles.processingSubtext}>Evaluating pitch, tone, and tempo. This usually takes 5-10 seconds.</p>
            <button onClick={resetAnalysis} className={`${styles.cancelButton} ${styles.cancelJobButton}`}>
                Cancel Job
            </button>
        </div>
    );
    
    return (
        <AppShell>
            <div className={styles.appContainer}>
                <div className={styles.pageWrapper}>
                    <header className={styles.header}>
                        <div className={styles.headerTitleGroup}>
                            <Link to="/voice" className={styles.backButton}>
                                <ArrowLeft className={styles.iconSmall} /> Back to Voice Hub
                            </Link>
                            <h1 className={styles.mainTitle}>Emotion Detection</h1>
                            <p className={styles.subText}>AI-powered spectral voice analysis to detect emotional states.</p>
                        </div>
                    </header>

                    {error && (
                        <div className={styles.errorBanner}>
                            <AlertCircle className={styles.iconSmall} /> {error}
                        </div>
                    )}

                    <div className={styles.mainGrid}>
                        {/* --- LEFT COLUMN: Input & Info --- */}
                        <div className={styles.inputColumn}>
                            <div className={styles.inputCard}>
                                <div className={styles.cardHeader}>
                                    <h3>Audio Input Source</h3>
                                </div>
                                <div className={styles.cardBody}>
                                    {status === 'idle' && renderIdleState()}
                                    {status === 'analyzing' && renderProcessingState()}
                                    {status === 'success' && (
                                        <div className={styles.successState}>
                                            <div className={styles.successIconWrapper}>
                                                <Check className={styles.successIcon} />
                                            </div>
                                            <h4 className={styles.processingTitle}>Analysis Complete</h4>
                                            <p className={styles.processingSubtext}>Review the emotional profile on the right.</p>
                                            
                                            <button onClick={resetAnalysis} className={styles.newAnalysisButton}>
                                                <RefreshCw className={styles.iconSmall} /> New Analysis
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className={styles.infoCard}>
                                <div className={styles.infoIcon}><Activity className={styles.iconSmall}/></div>
                                <div>
                                    <h4 className={styles.infoTitle}>Acoustic Analysis</h4>
                                    <p className={styles.infoText}>
                                        Our model identifies the primary emotional state by analyzing pitch, tone, tempo, and vocal intensity.
                                        <br/>
                                        <strong className={styles.infoDisclaimer}>Please note: our model may make small mistakes.</strong>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* --- RIGHT COLUMN: Results --- */}
                        <div className={styles.resultColumn}>
                            {status === 'success' && result ? (
                                <div className={`${styles.resultsContainer} ${getEmotionClass(result.dominant)}`}>
                                    
                                    <div className={styles.dominantResultHeader}>
                                        <div>
                                            <div className={styles.dominantLabel}>Final Detected Emotion</div>
                                            <div className={styles.dominantEmotion}>{result.dominant}</div>
                                        </div>
                                        <div className={styles.dominantScore}>
                                            {result.confidence}%
                                        </div>
                                    </div>

                                    {/* HUD CYBERPUNK CHART */}
                                    <div className={styles.chartCard}>
                                        <h4 className={styles.chartTitle}>
                                             <span className={styles.chartTitleAccent}></span>EMOTION DATA ANALYSIS
                                        </h4>
                                        <div style={{ width: '100%', height: 320, marginTop: '20px' }}>
                                            <ResponsiveContainer>
                                                <BarChart 
                                                    data={formatChartData(result.all_scores)} 
                                                    margin={{ top: 30, right: 10, left: 10, bottom: 20 }} 
                                                >
                                                    {/* SVG Glow Filter Definition */}
                                                    <defs>
                                                        <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                                                            <feGaussianBlur stdDeviation="3" result="blur" />
                                                            <feMerge>
                                                                <feMergeNode in="blur" />
                                                                <feMergeNode in="blur" />
                                                                <feMergeNode in="SourceGraphic" />
                                                            </feMerge>
                                                        </filter>
                                                    </defs>

                                                    {/* Subtle grid lines from image */}
                                                    <CartesianGrid stroke="rgba(0, 255, 255, 0.15)" vertical={false} />
                                                    
                                                    <XAxis 
                                                        dataKey="name" 
                                                        tick={<CustomXAxisTick />} 
                                                        axisLine={{ stroke: 'rgba(0, 255, 255, 0.5)', strokeWidth: 2 }} 
                                                        tickLine={false} 
                                                    />
                                                    
                                                    <YAxis hide domain={[0, 100]} />
                                                    
                                                    <Tooltip 
                                                        cursor={{ fill: 'rgba(0, 255, 255, 0.05)' }}
                                                        contentStyle={{ backgroundColor: 'rgba(10, 10, 16, 0.95)', border: '1px solid #00FFFF', color: '#00FFFF', borderRadius: '4px', boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)' }}
                                                        itemStyle={{ color: '#00FFFF', fontWeight: 'bold' }}
                                                        formatter={(value) => [`${value}%`, 'Confidence']}
                                                    />
                                                    
                                                    {/* Uniform Cyan Bars with Glow */}
                                                    <Bar dataKey="value" fill="#00FFFF" radius={[2, 2, 0, 0]} barSize={45} filter="url(#neonGlow)" animationDuration={1200}>
                                                        <LabelList content={<CustomTopLabel />} />
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className={styles.insightCard} style={{ marginTop: '30px' }}>
                                        <h3 className={styles.insightHeader}>
                                            <Sparkles className={styles.iconSmall} /> AI Emotion Insights
                                        </h3>
                                        <p className={styles.insightText}>
                                            {result.insight}
                                        </p>
                                    </div>

                                    

                                </div>
                            ) : (
                                <div className={styles.emptyState}>
                                    <Activity className={styles.emptyIcon} />
                                    <p className={styles.emptyTitle}>Awaiting Voice Analysis</p>
                                    <p className={styles.emptySubtext}>Upload an audio file to see the emotional profile.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.footerSection}>
                        <h3 className={styles.footerTitle}>Analysis Capabilities</h3>
                        <div className={styles.scrollingCardsContainer}>
                            <div className={styles.scrollCard}>
                                <div className={styles.scrollIconWrapper}><Sparkles className={styles.iconSmall} /></div>
                                <h4>Deep Learning AI</h4>
                                <p>Powered by advanced neural networks trained on thousands of distinct audio samples to map precise acoustic patterns.</p>
                            </div>
                            <div className={styles.scrollCard}>
                                <div className={styles.scrollIconWrapper}><Activity className={styles.iconSmall} /></div>
                                <h4>Spectral Analysis</h4>
                                <p>Evaluates micro-fluctuations in pitch, tone, and vocal tempo in milliseconds to determine underlying emotional states.</p>
                            </div>
                            <div className={styles.scrollCard}>
                                <div className={styles.scrollIconWrapper}><Shield className={styles.iconSmall} /></div>
                                <h4>Secure Processing</h4>
                                <p>Your audio files are securely processed and immediately discarded after analysis. Privacy and discretion are our top priority.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AppShell>
    );
}