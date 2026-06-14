import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import UploadDropzone from '../../components/UploadDropzone';
import AudioPlayer from '../../components/AudioPlayer';
import styles from './NoiseReduction.module.css';

const formatTimeWithoutMs = (seconds) => {
    const totalSeconds = Math.floor(seconds);
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};

const SettingsIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.466l-1.63.486a2 2 0 0 0-1.12 1.63L7 9.87l-.48 1.63a2 2 0 0 0 0 1.12l.48 1.63 1.63.486a2 2 0 0 0 1.12 1.63l.486 1.63a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.466l1.63-.486a2 2 0 0 0 1.12-1.63l.48-1.63.48 1.63a2 2 0 0 0 1.12-1.63l1.63-.486a2 2 0 0 0 2-2v-.44a2 2 0 0 0-2-2h-.466l-.486-1.63a2 2 0 0 0-1.63-1.12l-1.63-.48-.48-1.63a2 2 0 0 0-1.12-1.63l-.486-1.63a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>);
const DownloadIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>);
const MagicIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 4.5l-3 3-3-3"/><path d="M13.5 19.5l3-3 3 3"/><line x1="6" y1="21" x2="6" y2="15"/><line x1="18" y1="9" x2="18" y2="3"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="12" y1="9" x2="12" y2="3"/></svg>);
const ArrowLeft = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>);
const RefreshIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.92-10.26l1.08 1.69"/></svg>);

// --- NEW ICONS FOR CARDS ---
const AiIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>);
const WaveIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 7v10M22 10v4M7 7v10M2 10v4"/></svg>);
const StudioIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>);
// ---------------------------

const PROCESS_STEPS = [
    { key: 'detecting', label: 'Detecting noise profile', duration: 1500 },
    { key: 'reducing', label: 'Removing background noise', duration: 3000 },
    { key: 'enhancing', label: 'Enhancing voice clarity', duration: 1500 },
    { key: 'finalizing', label: 'Finalizing cleaned audio', duration: 500 },
];

const InlineRecorder = ({ onRecordStop }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);

    useEffect(() => {
        return () => clearInterval(timerRef.current);
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                audioBlob.name = "voice_recording.wav"; 
                onRecordStop(audioBlob, recordingTime);
                setRecordingTime(0);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Error accessing mic:", err);
            alert("Microphone access is required to record audio.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
        }
    };

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div className={styles.recorderContainer}>
            {/* Added Recorder Heading */}
            <h3 className={styles.recorderTitle}>Record New Audio</h3>
            
            <div className={`${styles.micIconWrapper} ${isRecording ? styles.pulsing : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="22"/>
                </svg>
            </div>
            <div className={styles.statusText}>
                {isRecording ? "Recording in progress..." : "Ready to Record"}
            </div>
            <div className={styles.timeDisplay}>
                {formatTime(recordingTime)} <span className={styles.timeLimit}>/ 02:00</span>
            </div>
            {!isRecording ? (
                <button onClick={startRecording} className={styles.recordBtn}>
                    <div className={styles.redDot}></div> Start Recording
                </button>
            ) : (
                <button onClick={stopRecording} className={styles.stopBtn}>
                    <div className={styles.squareIcon}></div> Stop Recording
                </button>
            )}
        </div>
    );
};

export default function NoiseReduction() {
    const [inputAudio, setInputAudio] = useState(null); 
    const [inputDuration, setInputDuration] = useState(0); 
    const [jobStatus, setJobStatus] = useState(null); 
    const [jobResult, setJobResult] = useState(null); 
    const [error, setError] = useState(null); 
    const [nrStrength, setNrStrength] = useState('Medium'); 

    const hasInput = useMemo(() => inputAudio !== null, [inputAudio]);
    const isProcessing = jobStatus && ['uploading', 'processing'].includes(jobStatus);
    const isReadyToStart = hasInput && jobStatus !== 'completed' && jobStatus !== 'error';

    const handleAudioReady = (audioBlobOrFile, duration) => {
        if (duration > 120) {
            setError("File duration exceeds the 2-minute limit.");
            return;
        }

        if (audioBlobOrFile.size > 5 * 1024 * 1024) {
            setError("File size exceeds the 5MB limit.");
            return;
        }

        if (audioBlobOrFile.name) {
            const ext = audioBlobOrFile.name.split('.').pop().toLowerCase();
            if (ext !== 'mp3' && ext !== 'wav') {
                setError("Only MP3 and WAV formats are supported.");
                return;
            }
        } else if (audioBlobOrFile.type) {
            if (!audioBlobOrFile.type.includes('mpeg') && !audioBlobOrFile.type.includes('wav')) {
                setError("Only MP3 and WAV formats are supported.");
                return;
            }
        }

        setInputAudio(audioBlobOrFile);
        setInputDuration(duration);
        setJobStatus('idle'); 
        setJobResult(null);
        setError(null);
    };

    const clearInput = () => {
        setInputAudio(null);
        setInputDuration(0);
        setJobStatus(null);
        setJobResult(null);
        setError(null);
    };

    const startProcessing = async () => {
        setJobStatus('uploading');
        setError(null);
        try {
            const formData = new FormData();
            formData.append("file", inputAudio);
            formData.append("strength", nrStrength);
            formData.append("noiseStrength", nrStrength);   // ✅ ADD THIS
            setJobStatus('processing');
            const response = await fetch("http://127.0.0.1:8000/noise-reduction", {
                method: "POST",
                body: formData
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Processing failed");
            setJobStatus('completed');
            setJobResult({
                originalFileUrl: URL.createObjectURL(inputAudio),
                processedFileUrl: data.cleaned_url, 
                duration: inputDuration,
                strength: nrStrength,
                fileName: "cleaned_audio.mp3"
            });
        } catch (err) {
            setJobStatus('error');
            setError(err.message);
        }
    };

    const getActiveStepIndex = () => {
        if (jobStatus === 'uploading') return -1; 
        if (jobStatus === 'completed' || jobStatus === 'error') return PROCESS_STEPS.length;
        return -1; 
    };

    const handleControlChange = (newStrength) => {
        setNrStrength(newStrength);
        if (jobStatus === 'completed' || jobStatus === 'error') {
            setJobStatus('idle');
            setJobResult(null);
        }
    };

    const renderProcessingStatus = () => {
        if (!isProcessing) return null;
        return (
            <div className={styles.statusPanel}>
                <h3 className={styles.statusTitle}>
                    {jobStatus === 'uploading' ? '🚀 Uploading Audio...' : '✨ Applying Noise Reduction...'}
                </h3>
                <div className={styles.progressBarOuter}>
                    <div className={`${styles.progressBarInner} ${jobStatus === 'uploading' ? styles.progressUploading : styles.progressProcessing}`} style={{ width: jobStatus === 'uploading' ? '30%' : '75%' }}></div>
                </div>
                <ul className={styles.stepList}>
                    {PROCESS_STEPS.map((step, index) => (
                        <li key={step.key} className={styles.stepItem}>
                            <span className={styles.stepText}>{step.label}</span>
                            <span className={styles.stepStatus}>
                                {jobStatus === 'completed' || index < getActiveStepIndex() ? 'Done' : (index === getActiveStepIndex() ? 'In Progress' : 'Pending')}
                            </span>
                        </li>
                    ))}
                </ul>
                <p className={styles.statusTip}>Estimated time: ~{jobStatus === 'uploading' ? '2 seconds' : '6 seconds'} based on file size.</p>
            </div>
        );
    };

    const renderPreviewAndDownload = () => {
        if (jobStatus !== 'completed' || !jobResult) return null;
        return (
            <div className={styles.previewCard}>
                <h2 className={styles.previewTitle}>Comparison: Original vs. Cleaned</h2>
                <div className={styles.audioComparisonColumn}>
                    <div className={styles.audioPlayerContainer}>
                        <h4 className={styles.audioLabel}>Original Audio</h4>
                        <AudioPlayer src={jobResult.originalFileUrl} title={inputAudio.name || `Recording`} className={styles.player}/>
                    </div>
                    <div className={styles.audioPlayerContainer}>
                        <h4 className={styles.audioLabel}>Noise-Reduced Audio</h4>
                        <AudioPlayer src={jobResult.processedFileUrl} title={jobResult.fileName} className={styles.player}/>
                    </div>
                </div>
                <div className={styles.actionButtonGroup}>
                    <a href={jobResult.processedFileUrl} download={jobResult.fileName} className={styles.downloadButton}>
                        <DownloadIcon className={styles.downloadIcon} /> Download Cleaned Audio
                    </a>
                    <button onClick={clearInput} className={styles.startNewButton}>
                        <RefreshIcon className={styles.downloadIcon} /> Start New
                    </button>
                </div>
            </div>
        );
    };
    
    return (
        <AppShell>
            <div className={styles.pageContainer}>
                <header className={styles.featureHeader}>
                    <Link to="/voice" className={styles.backLink}>
                        <ArrowLeft className={styles.iconSmall} /> Back to Voice Hub
                    </Link>
                    <h1 className={styles.featureTitle}>Noise Reduction</h1>
                    <p className={styles.subtitleText}>Upload or record audio to remove background noise, hiss, and hum.</p>
                </header>

                <div className={styles.mainGrid}>
                    <section className={styles.inputResultColumn}>
                        
                        {!hasInput && (
                            <div className={styles.inputAreaCard}>
                                <div className={styles.sideBySideWrapper}>
                                    <div className={styles.inputHalf}>
                                        <InlineRecorder onRecordStop={handleAudioReady} />
                                    </div>
                                    <div className={styles.verticalDivider}><span>OR</span></div>
                                    <div className={styles.inputHalf}>
                                        <UploadDropzone onFileSelect={handleAudioReady} />
                                    </div>
                                </div>
                                {error && <p className={styles.errorText}>❌ {error}</p>}
                            </div>
                        )}
                        
                        {isProcessing && renderProcessingStatus()}
                        
                        {isReadyToStart && (
                            <div className={styles.currentInputCard}>
                                <h3 className={styles.cardTitle}>Input Ready: {inputAudio.name || `Recording`}</h3>
                                <p className={styles.inputDetails}>
                                     Strength: {nrStrength}
                                </p>
                                <button onClick={startProcessing} className={styles.primaryButton}>
                                    <MagicIcon className={styles.buttonIcon} /> Start Noise Reduction
                                </button>
                                <button onClick={clearInput} className={styles.secondaryButton}>Change File</button>
                            </div>
                        )}

                        {renderPreviewAndDownload()}

                        {jobStatus === 'error' && error && (
                             <div className={`${styles.statusPanel} ${styles.statusError}`}>
                                <h3 className={styles.statusTitle}>❌ Processing Failed</h3>
                                <p className={styles.statusTip}>{error}</p>
                                <button onClick={clearInput} className={styles.secondaryButton}>Try Again</button>
                            </div>
                        )}
                    </section>
                    
                    <aside className={`${styles.sidebar} ${jobStatus === 'completed' ? styles.sidebarReduced : ''}`}>
                        <div className={styles.controlCard}>
                            <h3 className={styles.controlTitle}><SettingsIcon className={styles.settingsIcon} /> Noise Controls</h3>
                            <div className={styles.controlGroup}>
                                <label className={styles.controlLabel}>Reduction Strength: <span className={styles.controlValue}>{nrStrength}</span></label>
                                <input 
                                    type="range" min="0" max="2" value={nrStrength === 'Low' ? 0 : (nrStrength === 'Medium' ? 1 : 2)}
                                    onChange={(e) => handleControlChange(['Low', 'Medium', 'High'][e.target.value])}
                                    className={styles.rangeSlider} disabled={false} 
                                />
                                <div className={styles.sliderLabels}>
                                    <span>Low</span><span>Medium</span><span>High</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.tipsCard}>
                            <h3 className={styles.cardTitle}>Tips for Best Results</h3>
                            <ul className={styles.tipList}>
                                <li>Use high-quality source audio (WAV preferred).</li>
                                <li>Ensure the speaker is close to the microphone.</li>
                            </ul>
                        </div>
                    </aside>
                </div>

                {/* 🚨 NEW: 3 RELATED DESIGN CARDS 🚨 */}
                <section className={styles.infoCardsSection}>
                    <div className={styles.infoCard}>
                        <AiIcon className={styles.infoCardIcon} />
                        <h3 className={styles.infoCardTitle}>AI Noise Cancellation</h3>
                        <p className={styles.infoCardDesc}>Advanced machine learning algorithms instantly identify and isolate human speech from unwanted background noise.</p>
                    </div>
                    <div className={styles.infoCard}>
                        <WaveIcon className={styles.infoCardIcon} />
                        <h3 className={styles.infoCardTitle}>Preserve Vocal Tone</h3>
                        <p className={styles.infoCardDesc}>Removes hiss, hum, and static without distorting the natural frequency and warmth of your original voice.</p>
                    </div>
                    <div className={styles.infoCard}>
                        <StudioIcon className={styles.infoCardIcon} />
                        <h3 className={styles.infoCardTitle}>Studio-Quality Results</h3>
                        <p className={styles.infoCardDesc}>Transform noisy phone recordings or outdoor interviews into crisp, professional studio-quality audio in seconds.</p>
                    </div>
                </section>
                {/* ---------------------------------- */}

            </div>
        </AppShell>
    );
}