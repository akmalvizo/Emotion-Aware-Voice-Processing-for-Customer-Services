// src/pages/Voice/VoiceToText.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import AppShell from '../../components/AppShell'; 
import styles from './VoiceToText.module.css';
import useRecorder from '../../components/Recorder/useRecorder';
import { Link } from 'react-router-dom';

// --- Constants & Helper Functions ---

const SUPPORTED_FORMATS = ['MP3', 'WAV', 'M4A', 'FLAC', 'WEBM']; 
const MAX_FILE_SIZE_MB = 20;
const MAX_DURATION_MIN = 1; 
const MAX_DURATION_SEC = 60; 

// --- NEW ICONS FOR CARDS ---
const TextDocumentIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>);
const SearchIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>);
const EditIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
// ---------------------------

// --- useTranscription Hook ---
const useTranscription = (audioFile, languageConfig, processingConfig) => {
    const [status, setStatus] = useState('IDLE');
    const [progressStep, setProgressStep] = useState(0); 
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState(null);
    const totalSteps = 4;

    const startTranscription = useCallback(async () => {
        if (!audioFile) {
            setError("Please upload an audio file before starting transcription.");
            return;
        }

        setTranscript('');
        setError(null);
        setProgressStep(0);
        setStatus('UPLOADING');

        try {
            setProgressStep(1); 

            const formData = new FormData();
            formData.append('file', audioFile);

            const res = await fetch('http://127.0.0.1:8000/transcribe', {
                method: 'POST',
                body: formData,
            });

            setStatus('ANALYZING');
            setProgressStep(2);

            const data = await res.json();

            setStatus('TRANSCRIBING');
            setProgressStep(3);

            if (!res.ok) {
                throw new Error(data.error || "Transcription failed.");
            }

            setTranscript(data.transcript || '');

            setStatus('COMPLETED');
            setProgressStep(4);

        } catch (err) {
            setStatus('FAILED');
            setError(err.message || "Unexpected error during transcription.");
        }
    }, [audioFile, languageConfig, processingConfig]);

    const reset = () => {
        setStatus('IDLE');
        setProgressStep(0);
        setTranscript('');
        setError(null);
    };

    return {
        status,
        progressStep,
        totalSteps,
        transcript,
        error,
        startTranscription,
        reset,
    };
};

// --- Main Component ---

const VoiceToTextPage = () => {
    const [audioFile, setAudioFile] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null); 
    const [fileDuration, setFileDuration] = useState('0:00');
    const [recordedBlob, setRecordedBlob] = useState(null); 
    const [fileError, setFileError] = useState(null); // ADDED: Local state for file validation errors
    const [languageConfig, setLanguageConfig] = useState({
        manual: false,
        code: 'auto', 
    });
    const [processingConfig, setProcessingConfig] = useState({
        diarization: true,
        punctuation: true,
        formatting: true,
    });
    const [isCopied, setIsCopied] = useState(false); 
    
    const fileInputRef = useRef(null);
    const outputRef = useRef(null);

    const handleRecorderStop = useCallback((blob, time) => {
        setRecordedBlob(blob);
        const recordedFile = new File([blob], `recording.wav`, { type: 'audio/wav' });
        
        handleFileChange(recordedFile, time); 
    }, []);

    const {
        recording: isRecording, 
        time: recordingTime,
        error: micError, 
        start: startRecording,
        stop: stopRecording,
        cancel: cancelRecording,
    } = useRecorder(handleRecorderStop); 

    const {
        status,
        progressStep,
        totalSteps,
        transcript,
        error,
        startTranscription,
        reset,
    } = useTranscription(audioFile, languageConfig, processingConfig);

    const isProcessing = status !== 'IDLE' && status !== 'COMPLETED' && status !== 'FAILED';
    const isComplete = status === 'COMPLETED';
    const isError = status === 'FAILED' && (error || micError); 
    
    const formatDuration = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const resetAndClearFile = useCallback(() => {
        setAudioFile(null);
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl); 
        }
        setAudioUrl(null);
        setFileDuration('0:00');
        setRecordedBlob(null);
        setFileError(null); // CLEARED error here
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        cancelRecording(); 
        reset(); 
    }, [reset, cancelRecording, audioUrl]);

    const handleFileChange = (file, durationSeconds = null) => {
        if (file) {
            const fileExtension = file.name.split('.').pop().toUpperCase();
            if (!SUPPORTED_FORMATS.some(ext => fileExtension === ext || file.type.includes(ext.toLowerCase()))) {
                resetAndClearFile();
                // FIXED: using setFileError instead of undefined setError
                return setFileError(`Unsupported format: ${fileExtension}. Supported are: ${SUPPORTED_FORMATS.join(', ')}.`);
            }

            if (durationSeconds !== null) {
                if (durationSeconds > MAX_DURATION_SEC) {
                    resetAndClearFile();
                    return setFileError(`Audio duration exceeds the strict ${MAX_DURATION_MIN}-minute limit.`);
                }
                setAudioFile(file);
                setAudioUrl(URL.createObjectURL(file)); 
                setFileError(null);
                setFileDuration(formatDuration(durationSeconds));
                if (status !== 'IDLE') reset();
            } else {
                const audio = new Audio(URL.createObjectURL(file));
                audio.onloadedmetadata = () => {
                    if (audio.duration > MAX_DURATION_SEC) {
                        resetAndClearFile();
                        return setFileError(`Audio duration exceeds the strict ${MAX_DURATION_MIN}-minute limit.`);
                    }
                    setAudioFile(file);
                    setAudioUrl(URL.createObjectURL(file)); 
                    setFileError(null);
                    setFileDuration(formatDuration(audio.duration));
                    URL.revokeObjectURL(audio.src); 
                    if (status !== 'IDLE') reset();
                };
            }
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.add(styles['drag-active']); 
    };
    
    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove(styles['drag-active']); 
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove(styles['drag-active']); 
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            resetAndClearFile(); 
            handleFileChange(e.dataTransfer.files[0]);
        }
    };
    
    const handleRecordToggle = async () => {
        if (isRecording) {
            stopRecording(); 
        } else {
            resetAndClearFile(); 
            startRecording(); 
        }
    };
    
    const handleCopy = () => {
        navigator.clipboard.writeText(transcript);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); 
    };

    const handleDownload = (format) => {
        const content = format === 'TXT' && isComplete ? transcript : recordedBlob || transcript;
        const mimeType = format === 'TXT' ? 'text/plain' : 'application/msword';
        const fileExtension = format === 'DOCX' ? 'docx' : 'txt';

        const element = document.createElement("a");
        const file = new Blob([content], {type: mimeType});
        element.href = URL.createObjectURL(file);
        element.download = `transcript.${fileExtension}`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    useEffect(() => {
        if (isProcessing && outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [status, isProcessing]);
    
    const renderStatusStep = (step, label) => (
        <div 
            className={`${styles['progress-step']} ${progressStep > step ? styles.completed : progressStep === step ? styles.active : ''}`}
        >
            <div className={styles['step-circle']}>
                {progressStep > step ? '✓' : (step + 1)}
            </div>
            <div className={styles['step-label']}>{label}</div>
        </div>
    );

    return (
        <AppShell>
            <div className={styles['voice-to-text-content-wrapper']}>
                
                <header className={styles['page-header']}>
                    <Link to="/voice" className={styles['back-link']}>← Back to Voice Hub</Link>
                    <h2>Voice-to-Text Transcription</h2>
                    <p>Convert spoken audio from uploaded files or live recordings into editable, structured text using our smart transcription engine.</p>
                </header>

                <div className={styles['content-container']}>
                    
                    {/* TOP ROW */}
                    <div className={styles['top-row']}>
                        
                        {/* Audio Input Block */}
                        <section className={`${styles['input-section']} ${styles.card}`}>
                            <h3 style={{ color: '#00e5ff' }}>Audio Input</h3>
                            
                            {audioFile ? (
                                <div className={styles['file-preview']} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ overflow: 'hidden' }}>
                                            <p className={styles['file-name']}>File Selected: {audioFile.name}</p>
                                        </div>
                                        <button onClick={resetAndClearFile} className={styles['btn-secondary']}>Change File</button>
                                    </div>
                                    {audioUrl && (
                                        <audio controls src={audioUrl} style={{ width: '100%', marginTop: '15px', height: '40px' }} />
                                    )}
                                </div>
                            ) : (
                                <>
                                    {isRecording ? (
                                        <div className={styles['recording-indicator']}>
                                            <div className={styles['recording-dot']}></div>
                                            <p>Recording... {formatDuration(recordingTime)} / 1:00</p>
                                        </div>
                                    ) : (
                                        <div 
                                            className={`${styles['drop-area']} ${styles['new-drop-style']}`}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            style={{ border: '2px dashed #008b8b', borderRadius: '8px', padding: '30px', textAlign: 'center', backgroundColor: '#0a192f', marginBottom: '15px' }}
                                        >
                                            {/* 🚨 REMOVED THE CYAN ARROW PATH FROM THIS SVG 🚨 */}
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom: '10px'}}>
                                                <path d="M12 2v20M17 5v14M22 10v4M7 5v14M2 10v4"/>
                                            </svg>
                                            
                                            <p style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '15px' }}>Elevate your audio. Drag & drop files.</p>
                                            
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={(e) => handleFileChange(e.target.files[0])}
                                                accept={SUPPORTED_FORMATS.map(f => `.${f.toLowerCase()}`).join(',')}
                                                hidden
                                            />
                                            <button 
                                                onClick={() => fileInputRef.current.click()} 
                                                className={`${styles['btn-upload']} ${styles['cyan-btn-small']}`}
                                                disabled={isProcessing || isRecording}
                                                style={{ backgroundColor: '#00e5ff', color: '#000', border: 'none', padding: '8px 20px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                                                Select File
                                            </button>
                                        </div>
                                    )}
                                    <button 
                                        onClick={handleRecordToggle} 
                                        className={`${styles['btn-record']} ${styles['dark-btn-full']} ${isRecording ? styles['btn-stop'] : ''}`}
                                        disabled={isProcessing || (!isRecording && audioFile)}
                                        style={{ width: '100%', backgroundColor: '#112240', color: '#fff', border: '1px solid #233554', padding: '12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                                        {isRecording ? 'Stop Recording' : 'Start Microphone Recording'}
                                    </button>
                                </>
                            )}

                            {/* FIXED: Added fileError to UI check */}
                            {(isError || micError || fileError) && (
                                <div className={styles['error-message']}>
                                    <p>Error: {fileError || error || micError}</p>
                                    <button onClick={resetAndClearFile} className={styles['btn-secondary']}>Clear Error & Start Over</button>
                                </div>
                            )}
                            
                            <div className={styles['limits-display']} style={{ marginTop: '15px', fontSize: '0.85rem', color: '#8892b0' }}>
                                <p>Max File Size: {MAX_FILE_SIZE_MB}MB | Max Duration: {MAX_DURATION_MIN} min</p>
                                <p className={styles['note']} style={{ fontStyle: 'italic', marginTop: '5px' }}>• Current plan supports Standard Transcription Preset.</p>
                            </div>
                            
                            {/* Primary Action Button */}
                            <div className={styles['transcribe-action-area']} style={{ marginTop: '20px' }}>
                                <button
                                    onClick={isComplete ? resetAndClearFile : startTranscription}
                                    className={`${styles['btn-primary']} ${styles['cyan-btn-large']}`}
                                    disabled={(!audioFile && !isComplete) || isProcessing}
                                    style={{ width: '100%', backgroundColor: '#00e5ff', color: '#000', border: 'none', padding: '15px', borderRadius: '30px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                                    {isProcessing ? 'Processing...' : isComplete ? 'Start New Transcription' : 'Transcribe Audio'}
                                </button>
                            </div>
                        </section>

                        {/* Settings / Status Block */}
                        <section className={`${styles['config-section']} ${styles.card}`}>
                            {isProcessing ? (
                                <div className={styles['status-wrapper']}>
                                    <h3>Transcription Job Status</h3>
                                    <div className={styles['progress-bar-container']}>
                                        <div 
                                            className={styles['progress-bar']} 
                                            style={{ width: `${(progressStep / totalSteps) * 100}%` }}
                                        ></div>
                                    </div>
                                    <p className={styles['status-text']}>Current Step: {status}</p>
                                    <div className={styles['progress-steps-list']}>
                                        {renderStatusStep(1, 'Uploading audio')}
                                        {renderStatusStep(2, 'Analyzing speech')}
                                        {renderStatusStep(3, 'Transcribing')}
                                        {renderStatusStep(4, 'Finalizing text')}
                                    </div>
                                </div>
                            ) : (
                                <div className={styles['settings-wrapper']}>
                                    <h3>Transcription Settings</h3>
                                    <div className={styles['control-group']}>
                                        <label>Source Language</label>
                                        <div className={styles['control-row']}>
                                            <select 
                                                value={languageConfig.code} 
                                                onChange={(e) => setLanguageConfig({ ...languageConfig, code: e.target.value, manual: e.target.value !== 'auto' })}
                                                disabled={true} 
                                            >
                                                <option value="auto">English (Auto-Detect)</option>
                                                <option value="en-US">English (US)</option>
                                                <option value="en-GB">English (UK)</option>
                                                <option value="en-GL">English (Global)</option>
                                            </select>
                                            {languageConfig.manual && <span className={styles['warning-badge']}>Manual</span>}
                                        </div>
                                    </div>

                                    <div className={`${styles['control-group']} ${styles['switch-group']}`}>
                                        <label htmlFor="diarization">Speaker Detection (Diarization)</label>
                                        <input 
                                            type="checkbox" 
                                            id="diarization" 
                                            checked={processingConfig.diarization} 
                                            onChange={(e) => setProcessingConfig({ ...processingConfig, diarization: e.target.checked })} 
                                            disabled={true} 
                                        />
                                    </div>

                                    <div className={`${styles['control-group']} ${styles['switch-group']}`}>
                                        <label htmlFor="punctuation">Auto Punctuation</label>
                                        <input 
                                            type="checkbox" 
                                            id="punctuation" 
                                            checked={processingConfig.punctuation} 
                                            onChange={(e) => setProcessingConfig({ ...processingConfig, punctuation: e.target.checked })} 
                                            disabled={true} 
                                        />
                                    </div>
                                    <div className={`${styles['control-group']} ${styles['switch-group']}`}>
                                        <label htmlFor="formatting">Smart Paragraph Formatting</label>
                                        <input 
                                            type="checkbox" 
                                            id="formatting" 
                                            checked={processingConfig.formatting} 
                                            onChange={(e) => setProcessingConfig({ ...processingConfig, formatting: e.target.checked })} 
                                            disabled={true} 
                                        />
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                    
                    {/* BOTTOM ROW: Output Block */}
                    <div className={styles['output-row']}>
                        <section className={`${styles['output-section']} ${styles.card}`}>
                            
                            <div className={styles['output-header']}>
                                <h3>Transcription Output</h3>
                                {isComplete && <span className={styles['success-badge']}>✅ Completed</span>}
                            </div>

                            <textarea
                                ref={outputRef}
                                className={styles['transcript-textarea']}
                                value={transcript || (isProcessing ? `[${status.toUpperCase()}] ...Please wait.` : '')}
                                placeholder="Your transcribed text will appear here."
                                readOnly={isProcessing}
                                disabled={isProcessing}
                                onChange={(e) => isComplete && setTranscript(e.target.value)} 
                            />

                            <div className={styles['action-buttons']}>
                                <button 
                                    onClick={handleCopy} 
                                    className={styles['btn-secondary']} 
                                    disabled={!isComplete}
                                >
                                    {isCopied ? '✅ Copied!' : 'Copy to Clipboard'}
                                </button>
                                 
                                <div className={styles['dropdown']}>
                                    <button 
                                        className={`${styles['btn-secondary']} ${styles['dropdown-toggle']}`} 
                                        disabled={!isComplete}
                                    >
                                        Download As...
                                    </button>
                                    <div className={styles['dropdown-content']}>
                                        <a href="#" onClick={(e) => {e.preventDefault(); handleDownload('TXT');}}>Download TXT</a>
                                        <a href="#" onClick={(e) => {e.preventDefault(); handleDownload('DOCX');}}>Download DOCX</a>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* 🚨 NEW: 3 RELATED DESIGN CARDS 🚨 */}
                    <section className={styles.infoCardsSection}>
                        <div className={styles.infoCard}>
                            <TextDocumentIcon className={styles.infoCardIcon} />
                            <h3 className={styles.infoCardTitle}>High Accuracy Transcripts</h3>
                            <p className={styles.infoCardDesc}>Our advanced AI engine ensures precise word recognition, delivering highly accurate text documents from your voice files.</p>
                        </div>
                        <div className={styles.infoCard}>
                            <SearchIcon className={styles.infoCardIcon} />
                            <h3 className={styles.infoCardTitle}>Searchable Audio</h3>
                            <p className={styles.infoCardDesc}>Convert hours of spoken word into instantly searchable text, making it easy to find specific quotes or information.</p>
                        </div>
                        <div className={styles.infoCard}>
                            <EditIcon className={styles.infoCardIcon} />
                            <h3 className={styles.infoCardTitle}>Editable Output</h3>
                            <p className={styles.infoCardDesc}>Review and edit your generated transcripts directly in the interface before copying or exporting to your preferred format.</p>
                        </div>
                    </section>
                    {/* ---------------------------------- */}

                </div>
            </div>
        </AppShell>
    );
};

export default VoiceToTextPage;