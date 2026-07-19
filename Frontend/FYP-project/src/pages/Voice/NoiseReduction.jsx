import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import AudioPlayer from '../../components/AudioPlayer';
import styles from './NoiseReduction.module.css';

// ── Icons ──────────────────────────────────────────────────────────────────
const SettingsIcon  = (p) => (<svg {...p} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>);
const DownloadIcon  = (p) => (<svg {...p} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>);
const MagicIcon     = (p) => (<svg {...p} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4V2m0 14v-2M8 9H2m14 0h-2m-1.172-4.243L11.414 6.17M16.243 16.243l-1.414-1.414M4.929 19.071l1.414-1.414M19.071 4.929l-1.414 1.414M12 12l-8 8"/></svg>);
const ArrowLeft     = (p) => (<svg {...p} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>);
const RefreshIcon   = (p) => (<svg {...p} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.92-10.26l1.08 1.69"/></svg>);
const UploadIcon    = (p) => (<svg {...p} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>);
const AiIcon        = (p) => (<svg {...p} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>);
const WaveIcon      = (p) => (<svg {...p} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 7v10M22 10v4M7 7v10M2 10v4"/></svg>);
const StudioIcon    = (p) => (<svg {...p} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>);
const CheckIcon     = (p) => (<svg {...p} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>);
// ───────────────────────────────────────────────────────────────────────────

// ── Inline file-upload panel (replaces generic UploadDropzone) ─────────────
const UploadPanel = ({ onFileSelect }) => {
    const [dragging, setDragging] = useState(false);
    const [fileError, setFileError] = useState(null);
    const inputRef = useRef(null);

    const getAudioDuration = (file) =>
        new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            const audio = new Audio(url);
            audio.addEventListener('loadedmetadata', () => { URL.revokeObjectURL(url); resolve(audio.duration); });
            audio.addEventListener('error', () => { URL.revokeObjectURL(url); reject(new Error('Could not read audio')); });
        });

    const validate = async (file) => {
        setFileError(null);
        const ext = file.name.split('.').pop().toLowerCase();
        if (ext !== 'mp3' && ext !== 'wav') { setFileError('Only MP3 and WAV are supported.'); return; }
        if (file.size > 5 * 1024 * 1024) { setFileError('File exceeds 5 MB limit.'); return; }
        try {
            const dur = await getAudioDuration(file);
            if (dur > 120) { setFileError('Audio exceeds 2-minute limit.'); return; }
            onFileSelect(file, dur);
        } catch { setFileError('Could not read audio file.'); }
    };

    const onDrop = (e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) validate(e.dataTransfer.files[0]); };
    const onChange = (e) => { if (e.target.files[0]) validate(e.target.files[0]); };

    return (
        <div className={styles.uploadPanel}>
            <h3 className={styles.panelTitle}>Upload Audio File</h3>

            <div
                className={`${styles.dropZone} ${dragging ? styles.dropZoneDragging : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".mp3,.wav,audio/mpeg,audio/wav"
                    onChange={onChange}
                    style={{ display: 'none' }}
                />
                <div className={styles.dropZoneIconRing}>
                    <UploadIcon className={styles.dropZoneSvg} />
                </div>
                <p className={styles.dropZoneMain}>Drag &amp; drop here</p>
                <p className={styles.dropZoneHint}>or click to browse files</p>
                <span className={styles.dropZoneBadge}>MP3 · WAV · Max 5 MB · 2 min</span>
            </div>

            {fileError && <p className={styles.errorText}>❌ {fileError}</p>}
        </div>
    );
};

// ── Inline recorder ────────────────────────────────────────────────────────
const InlineRecorder = ({ onRecordStop }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef   = useRef([]);
    const timerRef         = useRef(null);

    useEffect(() => () => clearInterval(timerRef.current), []);

    const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mr = new MediaRecorder(stream);
            mediaRecorderRef.current = mr;
            audioChunksRef.current = [];
            mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
            mr.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                blob.name = 'voice_recording.wav';
                onRecordStop(blob, recordingTime);
                setRecordingTime(0);
                stream.getTracks().forEach((t) => t.stop());
            };
            mr.start();
            setIsRecording(true);
            timerRef.current = setInterval(() => setRecordingTime((p) => p + 1), 1000);
        } catch {
            alert('Microphone access is required to record audio.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
        }
    };

    return (
        <div className={styles.recorderPanel}>
            <h3 className={styles.panelTitle}>Record Audio</h3>

            <div className={`${styles.micRing} ${isRecording ? styles.micRingActive : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="22"/>
                </svg>
            </div>

            <p className={styles.recStatus}>{isRecording ? 'Recording in progress…' : 'Ready to record'}</p>
            <div className={styles.recTimer}>
                {fmt(recordingTime)} <span className={styles.recTimerLimit}>/ 02:00</span>
            </div>

            {!isRecording ? (
                <button onClick={startRecording} className={styles.recordBtn}>
                    <span className={styles.redDot} /> Start Recording
                </button>
            ) : (
                <button onClick={stopRecording} className={styles.stopBtn}>
                    <span className={styles.squareIcon} /> Stop Recording
                </button>
            )}
        </div>
    );
};

// ── Main component ─────────────────────────────────────────────────────────
export default function NoiseReduction() {
    const [inputAudio,    setInputAudio]    = useState(null);
    const [inputDuration, setInputDuration] = useState(0);
    const [jobStatus,     setJobStatus]     = useState(null);
    const [jobResult,     setJobResult]     = useState(null);
    const [error,         setError]         = useState(null);
    const [nrStrength,    setNrStrength]    = useState('Medium');

    const hasInput       = useMemo(() => inputAudio !== null, [inputAudio]);
    const isProcessing   = jobStatus && ['uploading', 'processing'].includes(jobStatus);
    const isReadyToStart = hasInput && jobStatus !== 'completed' && jobStatus !== 'error';

    const handleAudioReady = (fileOrBlob, duration) => {
        if (duration > 120)            { setError('Duration exceeds the 2-minute limit.'); return; }
        if (fileOrBlob.size > 5242880) { setError('File size exceeds the 5 MB limit.');    return; }
        setInputAudio(fileOrBlob);
        setInputDuration(duration);
        setJobStatus('idle');
        setJobResult(null);
        setError(null);
    };

    const clearInput = () => { setInputAudio(null); setInputDuration(0); setJobStatus(null); setJobResult(null); setError(null); };

    const startProcessing = async () => {
        setJobStatus('uploading');
        setError(null);
        try {
            const fd = new FormData();
            fd.append('file', inputAudio);
            fd.append('strength', nrStrength);
            fd.append('noiseStrength', nrStrength);
            setJobStatus('processing');
            const res  = await fetch('http://127.0.0.1:8000/noise-reduction', { method: 'POST', body: fd });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Processing failed');
            setJobStatus('completed');
            setJobResult({
                originalFileUrl:  URL.createObjectURL(inputAudio),
                processedFileUrl: data.cleaned_url,
                duration:         inputDuration,
                strength:         nrStrength,
                fileName:         'cleaned_audio.mp3',
            });
        } catch (err) {
            setJobStatus('error');
            setError(err.message);
        }
    };

    const handleControlChange = (val) => {
        setNrStrength(val);
        if (jobStatus === 'completed' || jobStatus === 'error') { setJobStatus('idle'); setJobResult(null); }
    };

    // ── Processing overlay ──────────────────────────────────────────────────
    const renderProcessing = () => {
        if (!isProcessing) return null;
        return (
            <div className={styles.processingCard}>
                <div className={styles.spinnerRing} />
                <h3 className={styles.processingTitle}>
                    {jobStatus === 'uploading' ? 'Uploading audio…' : 'Reducing noise…'}
                </h3>
                <p className={styles.processingHint}>
                    {jobStatus === 'uploading' ? 'Sending file to server…' : 'AI is cleaning your audio. This takes a few seconds.'}
                </p>
                <div className={styles.progressTrack}>
                    <div className={`${styles.progressFill} ${jobStatus === 'uploading' ? styles.progressUpload : styles.progressProcess}`} />
                </div>
                <ul className={styles.stepList}>
                    {['Detecting noise profile', 'Removing background noise', 'Enhancing vocal clarity', 'Finalizing output'].map((s, i) => (
                        <li key={i} className={styles.stepItem}>
                            <span className={styles.stepDot} />
                            <span className={styles.stepText}>{s}</span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    // ── Results section ─────────────────────────────────────────────────────
    const renderResults = () => {
        if (jobStatus !== 'completed' || !jobResult) return null;
        return (
            <div className={styles.resultsWrapper}>
                {/* Header */}
                <div className={styles.resultsHeader}>
                    <div className={styles.resultsBadge}>
                        <CheckIcon className={styles.resultsBadgeIcon} />
                        Noise Reduction Complete
                    </div>
                    <h2 className={styles.resultsTitle}>Before &amp; After</h2>
                    <p className={styles.resultsSubtitle}>
                        Strength applied: <strong>{jobResult.strength}</strong> · Duration: <strong>{Math.floor(jobResult.duration)}s</strong>
                    </p>
                </div>

                {/* Side-by-side audio cards */}
                <div className={styles.audioGrid}>
                    {/* Original */}
                    <div className={`${styles.audioCard} ${styles.audioCardOriginal}`}>
                        <div className={styles.audioCardHeader}>
                            <div className={styles.audioCardBadge}>
                                <span className={styles.badgeDotGray} /> Original Audio
                            </div>
                            <span className={styles.audioCardDuration}>{Math.floor(jobResult.duration)}s</span>
                        </div>
                        <div className={styles.audioCardWave}>
                            {[7,12,20,16,9,24,18,11,28,22,14,26,10,18,15,12,22,8,14,19,10,24,17,13,21,8].map((h, i) => (
                                <div key={i} className={styles.waveBar} style={{ height: `${h}px` }} />
                            ))}
                        </div>
                        <p className={styles.audioCardName} title={inputAudio?.name || 'voice_recording.wav'}>
                            {inputAudio?.name || 'voice_recording.wav'}
                        </p>
                        <div className={styles.audioPlayerWrap}>
                            <AudioPlayer src={jobResult.originalFileUrl} title="Original" />
                        </div>
                    </div>

                    {/* Arrow divider */}
                    <div className={styles.arrowDivider}>
                        <div className={styles.arrowLine} />
                        <svg className={styles.arrowSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                        <span className={styles.arrowLabel}>AI Enhanced</span>
                        <div className={styles.arrowLine} />
                    </div>

                    {/* Cleaned */}
                    <div className={`${styles.audioCard} ${styles.audioCardCleaned}`}>
                        <div className={styles.audioCardHeader}>
                            <div className={styles.audioCardBadge}>
                                <span className={styles.badgeDotCyan} /> Cleaned Audio
                            </div>
                            <span className={styles.audioCardDurationCyan}>{Math.floor(jobResult.duration)}s</span>
                        </div>
                        <div className={styles.audioCardWave}>
                            {[5,9,14,11,6,16,12,7,18,14,9,17,6,12,10,7,14,5,10,15,8,18,13,9,16,5].map((h, i) => (
                                <div key={i} className={`${styles.waveBar} ${styles.waveBarCyan}`} style={{ height: `${h}px` }} />
                            ))}
                        </div>
                        <p className={styles.audioCardName} title={jobResult.fileName}>
                            {jobResult.fileName}
                        </p>
                        <div className={styles.audioPlayerWrap}>
                            <AudioPlayer src={jobResult.processedFileUrl} title="Cleaned" />
                        </div>
                        <a
                            href={jobResult.processedFileUrl}
                            download={jobResult.fileName}
                            className={styles.downloadBtn}
                        >
                            <DownloadIcon className={styles.downloadBtnIcon} />
                            Download Cleaned Audio
                        </a>
                    </div>
                </div>

                {/* Actions */}
                <div className={styles.resultsActions}>
                    <button onClick={clearInput} className={styles.startNewBtn}>
                        <RefreshIcon className={styles.btnIcon} /> Process Another File
                    </button>
                </div>
            </div>
        );
    };

    return (
        <AppShell>
            <div className={styles.page}>
                {/* ── Header ── */}
                <header className={styles.header}>
                    <Link to="/voice" className={styles.backLink}>
                        <ArrowLeft className={styles.backIcon} /> Back to Voice Hub
                    </Link>
                    <h1 className={styles.pageTitle}>Noise Reduction</h1>
                    <p className={styles.pageSubtitle}>Remove background noise, hiss, and hum from any audio file using AI.</p>
                </header>

                <div className={styles.layout}>
                    {/* ── Main column ── */}
                    <section className={styles.mainCol}>

                        {/* Input cards */}
                        {!hasInput && (
                            <div className={styles.inputCard}>
                                <div className={styles.inputSplit}>
                                    <InlineRecorder onRecordStop={handleAudioReady} />
                                    <div className={styles.orDivider}><span>OR</span></div>
                                    <UploadPanel onFileSelect={handleAudioReady} />
                                </div>
                                {error && <p className={styles.errorText}>❌ {error}</p>}
                            </div>
                        )}

                        {/* Ready-to-process state */}
                        {isReadyToStart && (
                            <div className={styles.readyCard}>
                                <div className={styles.readyFileInfo}>
                                    <div className={styles.readyFileIcon}>🎵</div>
                                    <div>
                                        <p className={styles.readyFileName}>{inputAudio.name || 'voice_recording.wav'}</p>
                                        <p className={styles.readyFileMeta}>
                                            {Math.floor(inputDuration)}s · Strength: <strong>{nrStrength}</strong>
                                        </p>
                                    </div>
                                </div>
                                <div className={styles.readyActions}>
                                    <button onClick={startProcessing} className={styles.primaryBtn}>
                                        <MagicIcon className={styles.btnIcon} /> Start Noise Reduction
                                    </button>
                                    <button onClick={clearInput} className={styles.ghostBtn}>Change File</button>
                                </div>
                            </div>
                        )}

                        {/* Processing */}
                        {renderProcessing()}

                        {/* Results */}
                        {renderResults()}

                        {/* Error */}
                        {jobStatus === 'error' && error && (
                            <div className={styles.errorCard}>
                                <h3 className={styles.errorCardTitle}>❌ Processing Failed</h3>
                                <p className={styles.errorCardMsg}>{error}</p>
                                <button onClick={clearInput} className={styles.ghostBtn}>Try Again</button>
                            </div>
                        )}
                    </section>

                    {/* ── Sidebar ── */}
                    <aside className={styles.sidebar}>
                        <div className={styles.controlCard}>
                            <h3 className={styles.controlTitle}>
                                <SettingsIcon className={styles.controlIcon} /> Noise Controls
                            </h3>
                            <div className={styles.controlGroup}>
                                <p className={styles.controlLabel}>Reduction Strength</p>
                                <div className={styles.strengthBtns}>
                                    {['Low', 'Medium', 'High'].map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => handleControlChange(level)}
                                            className={`${styles.strengthBtn} ${nrStrength === level ? styles.strengthBtnActive : ''}`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                                <div className={styles.strengthDesc}>
                                    {nrStrength === 'Low' && <span>Gentle cleaning — preserves subtle details</span>}
                                    {nrStrength === 'Medium' && <span>Balanced — best for most recordings</span>}
                                    {nrStrength === 'High' && <span>Aggressive — ideal for very noisy audio</span>}
                                </div>
                            </div>
                        </div>

                        <div className={styles.tipsCard}>
                            <h3 className={styles.tipsTitle}>💡 Tips for Best Results</h3>
                            <ul className={styles.tipsList}>
                                <li>Use high-quality WAV source files when possible.</li>
                                <li>Keep the speaker close to the microphone.</li>
                                <li>Use <strong>High</strong> strength for very noisy environments.</li>
                                <li>Use <strong>Low</strong> to preserve subtle audio details.</li>
                            </ul>
                        </div>
                    </aside>
                </div>

                {/* ── Info cards ── */}
                <section className={styles.infoSection}>
                    <div className={styles.infoCard}>
                        <AiIcon className={styles.infoIcon} />
                        <h3 className={styles.infoTitle}>AI Noise Cancellation</h3>
                        <p className={styles.infoDesc}>Advanced ML algorithms instantly separate human speech from background noise.</p>
                    </div>
                    <div className={styles.infoCard}>
                        <WaveIcon className={styles.infoIcon} />
                        <h3 className={styles.infoTitle}>Preserve Vocal Tone</h3>
                        <p className={styles.infoDesc}>Removes hiss, hum, and static without distorting the natural warmth of your voice.</p>
                    </div>
                    <div className={styles.infoCard}>
                        <StudioIcon className={styles.infoIcon} />
                        <h3 className={styles.infoTitle}>Studio-Quality Output</h3>
                        <p className={styles.infoDesc}>Turn noisy recordings into crisp, professional audio in seconds.</p>
                    </div>
                </section>
            </div>
        </AppShell>
    );
}
