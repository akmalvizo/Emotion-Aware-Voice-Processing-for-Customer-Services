import React, { useState, useCallback } from 'react';
import { getAudioDuration } from '../utils/audioUtils'; // Sirf duration ke liye use kar rahe hain

export default function UploadDropzone({ onFileSelect }) {
    const [dragging, setDragging] = useState(false);
    const [fileError, setFileError] = useState(null);

    const validateAndSelectFile = useCallback(async (file) => {
        setFileError(null);

        // 1. STRICT FORMAT CHECK (Only MP3 and WAV)
        const ext = file.name.split('.').pop().toLowerCase();
        if (ext !== 'mp3' && ext !== 'wav') {
            setFileError(`Invalid format. Only MP3 and WAV are allowed.`);
            return;
        }

        // 2. STRICT SIZE CHECK (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setFileError(`File is too large. Max size is 5MB.`);
            return;
        }

        // 3. STRICT DURATION CHECK (120 seconds / 2 minutes)
        try {
            const duration = await getAudioDuration(file);
            if (duration > 120) {
                setFileError(`Audio is too long. Max duration is 120 seconds.`);
                return;
            }
            // Success
            onFileSelect(file, duration);
        } catch (err) {
            setFileError("Could not read audio duration. Please try another file.");
        }
    }, [onFileSelect]);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            validateAndSelectFile(files[0]);
        }
    };

    const handleFileChange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            validateAndSelectFile(files[0]);
        }
    };

    return (
        <div 
            className={`dropzone-container ${dragging ? 'is-dragging' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
        >
            <input 
                type="file" 
                id="file-upload" 
                className="dropzone-input" 
                onChange={handleFileChange} 
                accept=".mp3, .wav, audio/mpeg, audio/wav" // Browser ko restrict karne ke liye
            />
            
            <label htmlFor="file-upload" className="dropzone-label">
                <span className="upload-icon">⬆️</span>
                <p className="upload-text">Drag & drop an audio file here</p>
                {/* 🚨 Removed ** from here 🚨 */}
                <p className="upload-text-small" style={{ color: '#00FFFF' }}>or Click to browse</p> 
            </label>
            
            {/* 🚨 Hardcoded to explicitly remove M4A from UI 🚨 */}
            <p className="dropzone-constraints">
                Max 5MB, 2 min max. (mp3, wav)
            </p>

            {fileError && (
                <div className="alert-error mt-4" role="alert" style={{ color: '#ef4444', marginTop: '10px' }}>
                    {fileError}
                </div>
            )}
        </div>
    );
}