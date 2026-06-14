// src/components/Recorder/useRecorder.js
import { useRef, useState, useEffect } from 'react';
import { CONSTRAINTS } from '../../utils/audioUtils';

// Helper to find the best recording MIME type
const getMimeType = () => {
    if (MediaRecorder.isTypeSupported('audio/webm; codecs=opus')) {
        return 'audio/webm; codecs=opus';
    }
    if (MediaRecorder.isTypeSupported('audio/webm')) {
        return 'audio/webm';
    }
    return 'audio/wav'; // Fallback
};

export default function useRecorder(onStopCallback) {
  const [recording, setRecording] = useState(false);
  const [time, setTime] = useState(0);
  const [error, setError] = useState(null);
  
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const maxSeconds = CONSTRAINTS.MAX_DURATION_SECONDS;
  const mimeType = getMimeType();

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  async function start() {
    if (recording) return;

    try {
      setError(null);
      // 1. Get audio stream from microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 2. Initialize MediaRecorder
      const mr = new MediaRecorder(stream, { mimeType });
      mediaRef.current = { mr, stream };
      chunksRef.current = [];

      // 3. Define event handlers
      mr.ondataavailable = e => { 
          if (e.data.size) chunksRef.current.push(e.data); 
      };

      mr.onstop = () => {
        // Stop stream tracks to turn off the microphone light
        stream.getTracks().forEach(t => t.stop()); 

        // Create the Blob from collected chunks
        const blob = new Blob(chunksRef.current, { type: mimeType });

        // Call the provided callback with the result
        if (onStopCallback) {
            onStopCallback(blob, time);
        }
      };

      // 4. Start recording and timer
      mr.start();
      setRecording(true);
      setTime(0);
      
      timerRef.current = setInterval(() => setTime(t => {
        const nextTime = t + 1;
        if (nextTime >= maxSeconds) {
          stop(); // Auto-stop when max duration reached
          return maxSeconds;
        }
        return nextTime;
      }), 1000);
      
    } catch (err) {
      console.error('Microphone error:', err);
      // Handle permission denied or device not found errors
      setError(err.name === 'NotAllowedError' ? 'Microphone permission denied. Please enable it in your browser settings.' : 'Could not access microphone.');
      setRecording(false);
      setTime(0);
    }
  }

  function stop() {
    if (!mediaRef.current || mediaRef.current.mr.state === 'inactive') return;
    
    const { mr } = mediaRef.current;
    
    // Stop recording and clear timer
    if (mr.state !== 'inactive') mr.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    
    setRecording(false);
    // Note: The actual blob creation and callback happens inside mr.onstop
  }

  function cancel() {
    if (recording) {
        stop();
    }
    // Clear chunks and time without triggering onStopCallback
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setTime(0);
    chunksRef.current = [];
    if (mediaRef.current && mediaRef.current.stream) {
        mediaRef.current.stream.getTracks().forEach(t => t.stop());
    }
    setRecording(false);
  }

  return { 
      recording, 
      time, 
      error,
      maxSeconds,
      start, 
      stop,
      cancel
  };
}