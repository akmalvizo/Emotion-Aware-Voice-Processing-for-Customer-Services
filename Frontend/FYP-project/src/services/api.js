// Mocked APIs for standalone running
export const login = (credentials) => new Promise((resolve, reject) => {
  setTimeout(() => {
    if (credentials.email === 'talalnaeem00@gmail.com' && credentials.password === 'talal@34') {
      const mockResponse = { user: 'talal', isAdmin: false, token: 'mock-token' };
      localStorage.setItem('token', mockResponse.token);
      resolve(mockResponse);
    } else {
      reject(new Error('Invalid credentials'));
    }
  }, 1000);
});

export const register = (data) => new Promise((resolve) => {
  setTimeout(() => {
    // Mock success
    resolve({ user: data.username, isAdmin: false, token: 'mock-token' });
  }, 1000);
});

export const uploadAudio = (formData) => new Promise((resolve) => {
  setTimeout(() => {
    resolve({ data: { download_url: 'https://www.soundjay.com/buttons/beep-07a.mp3' } });
  }, 2000);
});

export const sttAudio = (formData) => new Promise((resolve) => {
  setTimeout(() => {
    resolve({ text: 'Mock transcribed text from audio.' });
  }, 2000);
});

export const ttsAudio = (data) => new Promise((resolve) => {
  setTimeout(() => {
    resolve({ download_url: 'https://www.soundjay.com/buttons/beep-07a.mp3' });
  }, 2000);
});

export const emotionAudio = (formData) => new Promise((resolve) => {
  setTimeout(() => {
    resolve({ emotions: { happy: 0.5, sad: 0.3, angry: 0.2 } });
  }, 2000);
});

export const getAdminStats = () => new Promise((resolve) => {
  setTimeout(() => {
    resolve({
      users: 10,
      uploads: [
        { id: 1, user: 'talal', feature: 'noise_reduction', status: 'done' },
        { id: 2, user: 'test', feature: 'voice_enhancer', status: 'done' },
      ],
      featureUsage: [
        { name: 'Noise Reduction', count: 5 },
        { name: 'Voice Enhancer', count: 3 },
      ],
    });
  }, 1000);
});