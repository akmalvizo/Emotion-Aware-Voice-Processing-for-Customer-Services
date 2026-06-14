// src/components/AudioPlayer.jsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { formatTime } from '../utils/audioUtils';

/**
 * Custom Audio Player component for playing back processed results.
 * @param {string} src - URL of the audio file.
 * @param {string} title - Title of the audio file (for display).
 */
export default function AudioPlayer({ src, title = 'Processed Audio' }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    // Calculate progress for the seek bar
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    // --- Event Handlers ---

    const handleLoadedMetadata = useCallback(() => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    }, []);

    const handleTimeUpdate = useCallback(() => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    }, []);

    const handleEnded = useCallback(() => {
        setIsPlaying(false);
        setCurrentTime(0); // Reset time on end
    }, []);

    const togglePlayPause = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(error => {
                console.error("Audio playback failed:", error);
            });
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e) => {
        if (audioRef.current) {
            const seekTime = (e.target.value / 100) * duration;
            audioRef.current.currentTime = seekTime;
            setCurrentTime(seekTime);
        }
    };

    // --- Effects & Setup ---

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        // Add event listeners
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('play', () => setIsPlaying(true));
        audio.addEventListener('pause', () => setIsPlaying(false));

        // Cleanup
        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('play', () => setIsPlaying(true));
            audio.removeEventListener('pause', () => setIsPlaying(false));
        };
    }, [handleLoadedMetadata, handleTimeUpdate, handleEnded]);

    // Update the src if it changes
    useEffect(() => {
        if (audioRef.current) {
            // Reset player state when new source loads
            audioRef.current.load(); 
            setIsPlaying(false);
            setCurrentTime(0);
        }
    }, [src]);

    return (
        <div className="audio-player-container">
            {/* The hidden HTML5 audio element */}
            <audio ref={audioRef} src={src} preload="metadata" />

            <div className="player-controls">
                <button 
                    onClick={togglePlayPause} 
                    className="btn btn-icon-sm"
                    title={isPlaying ? 'Pause' : 'Play'}
                >
                    {isPlaying ? '⏸️' : '▶️'}
                </button>
                
                <div className="time-display">{formatTime(currentTime)}</div>

                <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={progress}
                    onChange={handleSeek}
                    className="seek-slider"
                />

                <div className="time-display text-muted">{formatTime(duration)}</div>
            </div>
            
            <p className="audio-title-text">{title}</p>
        </div>
    );
}