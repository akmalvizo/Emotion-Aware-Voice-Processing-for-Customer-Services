// src/components/Recorder/Recorder.jsx
import React from 'react';
import useRecorder from './Recorder/useRecorder';
import { formatTime } from '../utils/audioUtils';

/**
 * UI Component for capturing audio via microphone.
 * @param {function} onRecordStop - Callback function (audioBlob, durationSeconds) => void
 */
export default function Recorder({ onRecordStop }) {
    const { 
        recording, 
        time, 
        error,
        maxSeconds,
        start, 
        stop,
        cancel 
    } = useRecorder(onRecordStop);
    
    const timeDisplay = formatTime(time);
    const maxTimeDisplay = formatTime(maxSeconds);
    const progress = (time / maxSeconds) * 100;

    return (
        <div className="recorder-container">
            <h3 className="recorder-title">
                {recording ? 'Recording...' : 'Record New Audio'}
            </h3>

            {error && (
                <div className="alert-error my-4">{error}</div>
            )}
            
            <div className="microphone-area">
                <div 
                    className={`recording-visualizer ${recording ? 'is-recording' : ''}`}
                    style={{ '--progress': `${progress}%` }}
                >
                    {/* Visual representation of microphone */}
                    <span className="mic-icon">🎙️</span>
                    <p className="mic-status-text">
                        {recording ? 'Listening...' : 'Ready to Record'}
                    </p>
                </div>

                <p className="timer-text">
                    {timeDisplay} / {maxTimeDisplay}
                </p>

                <div className="recorder-controls">
                    {recording ? (
                        <>
                            <button onClick={stop} className="btn btn-stop" title="Stop Recording">
                                ⬛ Stop
                            </button>
                            <button onClick={cancel} className="btn btn-cancel" title="Cancel Recording">
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={start} 
                            className="btn btn-record" 
                            disabled={!!error}
                            title="Start Recording"
                        >
                            🔴 Record
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}