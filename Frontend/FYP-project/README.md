# 🎙️ VoiceLab - Advanced Audio AI Command Center

![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.x-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.x-3776AB?style=for-the-badge&logo=python&logoColor=white)

VoiceLab is an advanced, intelligent web workspace engineered to clean, synthesize, transcribe, and decode acoustic data seamlessly. Operating on a decentralized, zero-authentication architecture, it bridges the gap between complex Deep Learning inference and high-performance, glassmorphism-inspired web systems.

---

## 🌟 Core AI Feature Suite

- **✍️ Speech-to-Text (VTT) Transcription:** Accurate real-time speech recognition utilizing OpenAI Whisper architectures via automated processing pipelines.
- **🤫 Spectral Noise Reduction:** Advanced audio cleaning that applies spectral subtraction algorithms to isolate human voice from persistent background noise.
- **✨ Audio Quality Enhancement:** Professional-grade vocal balancing using dynamic range equalization and LUFS volume normalization layers.
- **🗣️ Neural Text-to-Speech (TTS):** High-fidelity vocal synthesis that transforms written strings into natural, human-like voiceovers.
- **😊 Acoustic Emotion Detection:** Tone mapping and telemetry dashboards that analyze pitch, tempo, and MFCC vectors to quantify underlying human emotions.

---

## 🏗️ Technical Architecture & Optimization

- **Stateless Engineering:** Operates on a zero-auth model, prioritizing complete data anonymity and instantaneous client-to-backend data execution.
- **Client Ingestion Safeguards:** Strict frontend constraint validation layers that intercept and check media parameters (Max 5MB sizes, 120s durations) before server processing.
- **Memory Optimization:** Advanced cleanup routines running `useCallback` hook references and `URL.revokeObjectURL()` loops to eliminate hardware-induced lag.
- **Asynchronous Data Transport:** Asynchronous FastAPI backend processing coupled with multi-threaded streaming to handle heavy binary audio payloads seamlessly.

---

## 📁 Optimized File Structure

```text
FYP-project/
├── index.html                # Main web entry point viewport
├── package.json              # Managed libraries manifest
├── vite.config.js            # Bundler & compilation script rules
├── .env                      # API Base URL routing variables
├── public/                   # Static uncompiled favicons and assets
└── src/                      # Source codebase
    ├── main.jsx              # App mounting initiator
    ├── App.jsx               # Single-export clean router coordinator
    ├── globals.css           # Global layout variables & layout setup
    ├── assets/               # Portrait media graphics
    ├── utils/                # Audio constraints and data validators
    ├── components/           # Core atomic UI modules
    │   ├── AppShell.jsx      # Global shell structure
    │   ├── AudioPlayer.jsx   # HTML5 audio playback engine
    │   ├── Recorder.jsx      # Mic visualization layer
    │   ├── UploadDropzone.jsx# Validated drag-and-drop zone
    │   └── Layout/           # Global Header & Footer engines
    └── pages/                # Main interface views
        ├── Dashboard.jsx     # Master home with interactive Vanta.js dots
        ├── About.jsx         # Architecture metrics details page
        ├── PrivacyPolicy.jsx # Retention & anonymous processing statement
        ├── NotFound.jsx      # Fallback routing container
        └── Voice/            # Core AI processing feature views

        Installation & Local Setup
Prerequisites
Node.js (v18.0.0 or higher) & NPM

Development Setup
Navigate to the project root directory:

Bash
cd FYP-project
Install all core libraries using legacy alignment configurations:

Bash
npm install --legacy-peer-deps
Run the optimized local live server:

Bash
npm run dev
Open your browser and access the platform at: http://localhost:5173

🧑‍💻 Development Team
VoiceLab was collaboratively architected, researched, and deployed as a full-stack AI Engineering workspace by:

Talal — AI Core & Systems Engineer

Co-architected the asynchronous backend infrastructure and multi-part network data transport pipelines.

Designed the entire hardware-accelerated frontend architecture, WebGL visualizations (Vanta.js), client-side tensor constraints, and telemetry charting engines.

Akmal — ML Pipelines & Core Engineer

Spearheaded the backend pipeline engineering, deep learning model deployments, and dynamic server resource optimization.

Collaborated heavily on full-stack architecture layers, data array stream parsing, and custom signal-processing integration.

Joint ML Core Contributions: Together engineered the machine learning processing layers, audio resampling structures (16kHz standard calibration), and acoustic feature mapping models.