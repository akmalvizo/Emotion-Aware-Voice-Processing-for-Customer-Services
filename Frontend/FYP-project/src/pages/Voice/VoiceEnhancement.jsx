// src/pages/Voice/VoiceEnhancement.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import useRecorder from '../../components/Recorder/useRecorder'; 
import styles from './VoiceEnhancement.module.css'; 

const MAX_FILE_SIZE_MB = 10; 
const MAX_DURATION_SECONDS = 120; 
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_MIME_TYPES = ["audio/mpeg", "audio/wav", "audio/m4a", "audio/webm", "video/webm", "audio/mp3"];
const PROCESSING_STEPS = [
    { key: 'analyze', label: '1. Analyzing voice quality and presence...', duration: 800 },
    { key: 'clarity', label: '2. Enhancing clarity and speech sharpness...', duration: 1500 },
    { key: 'volume', label: '3. Balancing volume and equalization...', duration: 1000 },
    { key: 'normalize', label: '4. Normalizing loudness for consistent output...', duration: 700 },
    { key: 'finalize', label: '5. Finalizing enhanced output file...', duration: 500 },
];

// --- Placeholder Icons ---
const ArrowLeft = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>);
const Upload = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>);
const Mic = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>);
const Zap = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>);
const Check = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>);
const Download = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>);
const Repeat = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 1l4 4-4 4"/><path d="M21 5H3v8a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4v-3"/></svg>);

// --- NEW ICONS FOR DROPZONE & CARDS ---
const WaveIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5v14M22 10v4M7 5v14M2 10v4"/></svg>);
const SparklesIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg>);
const ActivityIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>);
const SlidersIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>);
// --------------------------------------

export default function VoiceEnhancement() {
    const [audioFile, setAudioFile] = useState(null);
    const [jobStatus, setJobStatus] = useState('input'); 
    const [jobResult, setJobResult] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [error, setError] = useState(null);
    const [originalFile, setOriginalFile] = useState(null);
    const [audioDuration, setAudioDuration] = useState(0);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [clarityLevel, setClarityLevel] = useState('Medium'); 
    const [normalizeVolume, setNormalizeVolume] = useState(true); 
    const [noiseStrength, setNoiseStrength] = useState("Medium");
    const [compression, setCompression] = useState(true);

    const isInputReady = useMemo(() => audioFile !== null, [audioFile]);
    const isProcessing = jobStatus === 'processing';

    const enhancementSettings = useMemo(() => ({
        clarityLevel, normalizeVolume
    }), [clarityLevel, normalizeVolume]);

    // --- Processing Logic ---
    const startProcessing = useCallback(async (file, duration, settings) => {
        setError(null);

        if (!file) {
            setError("No file selected");
            return;
        }
        if (duration > MAX_DURATION_SECONDS) {
            setError("Audio exceeds 2 minutes");
            return;
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            setError("File too large");
            return;
        }

        setJobStatus('processing');
        setJobResult(null);
        setCurrentStep(1);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("clarityLevel", settings.clarityLevel);
            formData.append("normalizeVolume", settings.normalizeVolume);

            // 🔥 NEW CONTROLS
            formData.append("noiseStrength", noiseStrength);
            formData.append("compression", compression);

            const response = await fetch("http://127.0.0.1:8000/enhance-audio", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            setCurrentStep(PROCESSING_STEPS.length);

            setJobStatus('completed');
            setJobResult({
                originalFileUrl: previewUrl, // Use the existing preview URL
                enhancedFileUrl: data.enhanced_url,
                fileName: file.name.replace(/\.[^/.]+$/, "") + "_enhanced.mp3",
                duration: duration.toFixed(1),
                settings
            });

        } catch (err) {
            setError("Enhancement failed: " + err.message);
            setJobStatus('input');
        }

    }, [previewUrl]);

    const handleFileUpload = (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            const audio = new Audio(url);
            
            audio.onloadedmetadata = () => {
                setAudioDuration(audio.duration);
                setPreviewUrl(url);
                setAudioFile({
                    file: file,
                    name: file.name,
                    duration: audio.duration.toFixed(1)
                });
                setOriginalFile(file);
                setJobStatus('input'); 
            };
            e.target.value = null; 
        }
    };

    const handleRecorderStop = useCallback((blob, time) => {
        const fileExtension = blob.type.split('/').pop() || 'webm'; 
        const recordedFile = new File([blob], `Recorded_Audio_${Date.now()}.${fileExtension}`, { type: blob.type });
        const url = URL.createObjectURL(recordedFile);
        
        setAudioDuration(time);
        setPreviewUrl(url);
        setAudioFile({
            file: recordedFile,
            name: recordedFile.name,
            duration: time.toFixed(1)
        });

        setOriginalFile(recordedFile);
        setJobStatus('input');
    }, []);

    const { 
        recording: isRecording, 
        time: recordingTime, 
        error: micError, 
        start: startRecording, 
        stop: stopRecording, 
        cancel: cancelRecording 
    } = useRecorder(handleRecorderStop);

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            setError(null);
            startRecording();
        }
    };

    const clearInput = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setAudioFile(null);
        setPreviewUrl(null);
        setJobStatus('input');
        setJobResult(null);
        setCurrentStep(0);
        setError(null);
        cancelRecording();
    };

    // --- Render Functions ---
    const renderInputArea = () => (
        <div className={styles.inputLayout}>
            
            <div className={styles.dropzonePanel}>
                <h3 className={styles.cardTitle}>Upload Audio</h3>
                
                {/* 🚨 Conditional rendering: Show Dropzone OR Uploaded File Box 🚨 */}
                {!isInputReady ? (
                    <div className={styles.dropzoneBox}>
                        {/* 🚨 REPLACED UPLOAD ICON WITH WAVE ICON (NO ARROW) 🚨 */}
                        <WaveIcon className={styles.dropzoneIcon} />
                        
                        <p className={styles.dropzoneText}>Drag and drop audio file</p>
                        <p className={styles.dropzoneSubtext}>— OR —</p>
                        <input 
                            type="file" 
                            id="audio-upload" 
                            className={styles.hiddenInput} 
                            onChange={handleFileUpload}
                            accept={ACCEPTED_MIME_TYPES.join(',')} 
                        />
                        <div className={styles.dropzoneButtons}>
                            <label htmlFor="audio-upload" className={styles.uploadButton}>
                                <Upload className={styles.iconSmall} /> Choose File
                            </label>
                            <button 
                                className={`${styles.recordButton} ${isRecording ? styles.recordingActive : ''}`} 
                                onClick={toggleRecording}
                                disabled={isProcessing}
                            >
                                <Mic className={styles.iconSmall} /> 
                                {isRecording ? `Stop Recording (${recordingTime}s)` : 'Record Voice'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.fileReadyBox}>
                        <h4 className={styles.fileReadyTitle}>File Ready for Enhancement</h4>
                        <div className={styles.fileInfoGroup}>
                            <p className={styles.fileName}>{audioFile.name}</p>
                            <p className={styles.fileDuration}>Duration: {audioDuration.toFixed(1)}s</p>
                        </div>
                        
                        {previewUrl && (
                            <audio controls src={previewUrl} className={styles.htmlAudioPlayerPreview}></audio>
                        )}

                        <div className={styles.fileReadyActions}>
                            <button 
                                onClick={() => startProcessing(audioFile.file, audioDuration, enhancementSettings)}
                                className={styles.enhanceCTA}
                            >
                                <Zap className={styles.iconSmall} /> Enhance Voice
                            </button>
                            <button onClick={clearInput} className={styles.cancelButton}>
                                Clear File
                            </button>
                        </div>
                    </div>
                )}

                <div className={styles.limitsText}>
                    <p>Free Plan Limits:  Max {MAX_FILE_SIZE_MB} MB  /  2 minutes</p>
                </div>
            </div>
            
            <div className={styles.settingsPanel}>
                <h3 className={styles.settingsTitle}>Enhancement Controls</h3>

                {/* 🚨 Controls set to show only (disabled) 🚨 */}
                <div className={styles.sliderGroup}>
                    <label className={styles.sliderLabel}>Clarity Enhancement: <span className={styles.controlValue}>{clarityLevel}</span></label>
                    <input 
                        type="range" 
                        min="0" 
                        max="2" 
                        value={clarityLevel === 'Low' ? 0 : (clarityLevel === 'Medium' ? 1 : 2)}
                        onChange={(e) => setClarityLevel(['Low', 'Medium', 'High'][e.target.value])}
                        className={styles.rangeSlider}
                        disabled={false} /* Disabled */
                    />
                    <div className={styles.sliderLabels}>
                        <span>Low (Subtle)</span>
                        <span>Medium</span>
                        <span>High (Sharp)</span>
                    </div>
                </div>

                <div className={styles.toggleGroup}>
                    <label className={styles.toggleLabel}>Volume Normalization (LUFS)</label>
                    <div className={styles.toggleContainer}>
                        <p className={styles.toggleDescription}>
                            {normalizeVolume ? 'Audio volume will be standardized.' : 'Original volume level will be kept.'}
                        </p>
                        <label className={styles.controlToggle}>
                            <input 
                                type="checkbox" 
                                checked={normalizeVolume}
                                onChange={(e) => setNormalizeVolume(e.target.checked)}
                                disabled={false} /* Disabled it if need */
                            />
                            <span className={styles.sliderRound}></span>
                        </label>
                    </div>
                </div>

                <div className={styles.tipsCard}>
                    <h3 className={styles.cardTitle}>Tips for Best Results</h3>
                    <ul className={styles.tipList}>
                        <li>Increase clarity level only for low-quality recordings to enhance speech focus and detail.</li>
                        <li>Turn off normalization when you want to maintain original loudness variations and natural tone.</li>
                    </ul>
                </div>
            </div>
        </div>
    );

    const renderProcessingArea = () => {
        const progressPercent = (currentStep / PROCESSING_STEPS.length) * 100;

        return (
            <div className={styles.processingWrapper}>
                <h2 className={styles.processingTitle}>Voice Enhancement in Progress...</h2>
                
                <div className={styles.progressCard}>
                    <div className={styles.progressSteps}>
                        {PROCESSING_STEPS.map((step, index) => (
                            <p 
                                key={step.key} 
                                className={`${styles.progressStepItem} ${index < currentStep ? styles.stepCompleted : ''} ${index === currentStep ? styles.stepActive : ''}`}
                            >
                                {index < currentStep ? <Check className={styles.stepCheck} /> : ''} {step.label}
                            </p>
                        ))}
                    </div>

                    <div className={styles.progressBarOuter}>
                        <div 
                            className={styles.progressBarInner} 
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                    <p className={styles.processingStatusText}>
                        {currentStep > 0 ? PROCESSING_STEPS[Math.min(currentStep - 1, PROCESSING_STEPS.length - 1)].label : "Initializing job..."}
                    </p>
                </div>
                
                <button onClick={clearInput} className={styles.cancelButton}>
                    Cancel Job
                </button>
            </div>
        );
    };

    const renderResultArea = () => {
        if (!jobResult) return null;

        const { originalFileUrl, enhancedFileUrl, fileName, duration, settings } = jobResult;
        
        return (
            <div className={styles.resultContainer}>
                <div className={styles.successMessage}>
                    <Check className={styles.resultCheckIcon} />
                    <h2 className={styles.resultHeadline}>Enhancement Complete!</h2>
                    <p className={styles.resultSubtext}>
                        File ready: {fileName} 
                    </p>
                </div>

                <div className={styles.comparisonGrid}>
                    <div className={styles.comparisonCard}>
                        <h4 className={styles.comparisonTitle}>Before (Original Audio)</h4>
                        <audio controls src={originalFileUrl} className={styles.htmlAudioPlayer}></audio>
                    </div>

                    <div className={styles.comparisonCard}>
                        <h4 className={styles.comparisonTitle}>After (Enhanced Audio)</h4>
                        <audio controls src={enhancedFileUrl} className={styles.htmlAudioPlayer}></audio>
                    </div>
                </div>

                <div className={styles.downloadPanel}>
                    <div className={styles.fileInfo}>
                        <p className={styles.settingsSummary}>
                            Settings Summary: Clarity: {settings.clarityLevel} | Norm: {settings.normalizeVolume ? 'ON' : 'OFF'}
                        </p>
                    </div>
                    
                    <div className={styles.actionButtons}>
                    <a href={enhancedFileUrl} download={fileName} className={`${styles.downloadBtn} ${styles.downloadMP3}`}>
                        <Download className={styles.iconSmall} /> Download MP3
                        </a>
                        <button onClick={() => startProcessing(originalFile, audioDuration, enhancementSettings)} className={styles.reEnhanceBtn}>
                            <Repeat className={styles.iconSmall} /> Re-Enhance
                        </button>
                        <button onClick={clearInput} className={styles.newFileBtn}>
                            New File
                        </button>
                    </div>
                </div>
            </div>
        );
    };
    
    return (
        <AppShell> 
            <div className={styles.pageContainer}>
                <header className={styles.header}>
                    {/* 🚨 Link size increased, colored correctly, and points to /voice 🚨 */}
                    <Link to="/voice" className={styles.backLink}>
                        <ArrowLeft className={styles.iconSmall} /> Back to Voice Hub
                    </Link>
                    <h1 className={styles.mainTitle}>Voice Enhancement 🎧</h1>
                    <p className={styles.subtitleText}>
                        Professional studio quality applied to your voice recordings using granular controls.
                    </p>
                </header>
                
                {(error || micError) && <div className={styles.errorText}>🚨 {error || micError}</div>} 

                <div className={styles.contentArea}>
                    {!isProcessing && renderInputArea()}
                    {jobStatus === 'processing' && renderProcessingArea()}
                    {jobStatus === 'completed' && renderResultArea()}
                </div>

                {/* 🚨 NEW: 3 RELATED DESIGN CARDS (VOICE ENHANCEMENT) 🚨 */}
                <div className={styles.footerCardsContainer}>
                    <h3 className={styles.footerCardsTitle}>Why Voice Enhancement?</h3>
                    <div className={styles.cardsGrid}>
                        <div className={styles.infoCard} style={{ animationDelay: '0s' }}>
                            <SparklesIcon className={styles.infoCardIcon} />
                            <h4>AI Audio Restoration</h4>
                            <p>Automatically fix muffled or distant voices, bringing speech to the forefront with crystal-clear precision.</p>
                        </div>
                        <div className={styles.infoCard} style={{ animationDelay: '0.1s' }}>
                            <ActivityIcon className={styles.infoCardIcon} />
                            <h4>Smart Normalization</h4>
                            <p>Achieve consistent broadcast-standard loudness without destroying the natural dynamics of your recording.</p>
                        </div>
                        <div className={styles.infoCard} style={{ animationDelay: '0.2s' }}>
                            <SlidersIcon className={styles.infoCardIcon} />
                            <h4>Granular Control</h4>
                            <p>Fine-tune enhancement intensity and compression levels to get the perfect balance for podcasts or videos.</p>
                        </div>
                    </div>
                </div>
                {/* ---------------------------------------------------- */}

            </div>
        </AppShell>
    );
}