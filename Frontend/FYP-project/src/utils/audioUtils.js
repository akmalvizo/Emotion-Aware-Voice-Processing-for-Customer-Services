// src/utils/audioUtils.js

/**
 * Valid allowed audio formats and max size/duration constraints.
 */
export const CONSTRAINTS = {
    ALLOWED_FORMATS: ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/m4a'],
    MAX_FILE_SIZE_MB: 5,
    MAX_DURATION_SECONDS: 45,
};

/**
 * Checks if the file size is within the allowed limit.
 * @param {File} file - The audio file object.
 * @returns {boolean}
 */
export function checkFileSize(file) {
    const maxSizeB = CONSTRAINTS.MAX_FILE_SIZE_MB * 1024 * 1024;
    return file.size <= maxSizeB;
}

/**
 * Checks if the file format is within the allowed list.
 * @param {File} file - The audio file object.
 * @returns {boolean}
 */
export function checkFileFormat(file) {
    return CONSTRAINTS.ALLOWED_FORMATS.includes(file.type);
}

/**
 * Extracts the duration of an audio Blob or File using the Audio element API.
 * This is an asynchronous operation.
 * @param {Blob | File} audioBlob - The audio data.
 * @returns {Promise<number>} - Duration in seconds, or 0 if validation fails.
 */
export function getAudioDuration(audioBlob) {
    return new Promise((resolve) => {
        const audio = new Audio();
        audio.onloadedmetadata = () => {
            if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
                resolve(Math.round(audio.duration));
            } else {
                // Could not determine duration
                resolve(0); 
            }
        };
        audio.onerror = () => {
            // Audio error (e.g., unsupported codec by browser)
            resolve(0); 
        };
        audio.src = URL.createObjectURL(audioBlob);
    });
}

/**
 * Checks if the duration is within the allowed limit.
 * @param {number} durationSeconds 
 * @returns {boolean}
 */
export function checkDurationLimit(durationSeconds) {
    return durationSeconds <= CONSTRAINTS.MAX_DURATION_SECONDS;
}

// Helper to format seconds into MM:SS
export function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}