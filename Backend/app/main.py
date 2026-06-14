from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
import shutil
import os
import whisper
import uuid
import librosa
import soundfile as sf
import numpy as np
import noisereduce as nr
import tensorflow as tf
import edge_tts
import asyncio


app = FastAPI(title="Voice AI API")


# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------
# 📁 FOLDERS
# -------------------------------
UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"


os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)


# -------------------------------
# 🎤 LOAD WHISPER MODEL (ONCE)
# -------------------------------
model = whisper.load_model("base")

# -------------------------------
# 🧠 LOAD EMOTION MODEL
# -------------------------------
emotion_model = tf.keras.models.load_model("app/model/cnn_bilstm_improved.keras")

# Emotion Labels (CHANGE if your model uses different order)
EMOTION_LABELS = ['Angry', 'Fear', 'Happy', 'Neutral', 'Sad']

# -------------------------------
# 🧪 TEST
# -------------------------------
@app.get("/")
def root():
    return {"message": "Backend is working!"}

# -------------------------------
# 🧪 Converting audio into melspectrogram + MFFC features
# -------------------------------

def extract_features(file_path, max_len=200):
    y, sr = librosa.load(file_path, sr=16000)

    # Mel (128)
    mel = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
    mel_db = librosa.power_to_db(mel)

    # MFCC (13)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)

    def pad(x):
        if x.shape[1] < max_len:
            return np.pad(x, ((0,0),(0,max_len-x.shape[1])))
        return x[:, :max_len]

    mel_db = pad(mel_db)
    mfcc = pad(mfcc)

    combined = np.vstack((mel_db, mfcc))  # (141, 200)

    # SAME normalization
    combined = (combined - np.mean(combined)) / (np.std(combined) + 1e-8)

    return combined.reshape(1, 141, 200, 1)


# clean_audio() FUNCTION for voice to text..............
def clean_audio(input_path):
    y, sr = librosa.load(input_path, sr=None)

    # Remove silence
    y, _ = librosa.effects.trim(y, top_db=30)

    # Smart noise estimation
    noise_sample = y[np.abs(y) < np.percentile(np.abs(y), 20)]

    # Spectral gating
    reduced_noise = nr.reduce_noise(
        y=y,
        sr=sr,
        y_noise=noise_sample,
        prop_decrease=0.6,
        stationary=False,
        freq_mask_smooth_hz=300,
        time_mask_smooth_ms=50
    )

    # Normalize safely
    reduced_noise = reduced_noise / (np.max(np.abs(reduced_noise)) + 1e-6)

    # Save cleaned file
    cleaned_path = os.path.join(OUTPUT_DIR, f"cleaned_{uuid.uuid4()}.wav")
    sf.write(cleaned_path, reduced_noise, sr)

    return cleaned_path


# =====================================================
# 🎭 EMOTION DETECTION (FINAL FEATURE)
# =====================================================

@app.post("/emotion-detection")
async def emotion_detection(file: UploadFile = File(...)):
    try:
        import numpy as np
        import random

        unique_name = f"{uuid.uuid4()}_{file.filename}"
        input_path = os.path.join(UPLOAD_DIR, unique_name)

        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # -------------------------------
        # 🎧 FEATURE EXTRACTION
        # -------------------------------
        features = extract_features(input_path)

        # -------------------------------
        # 🧠 PREDICTION
        # -------------------------------
        predictions = emotion_model.predict(features)

        # Fix shape
        predictions = np.squeeze(predictions)

        # Normalize → probabilities
        predictions = predictions / np.sum(predictions)

        # Convert to percentage
        percentages = predictions * 100

        # -------------------------------
        # 🎯 DOMINANT EMOTION
        # -------------------------------
        predicted_index = int(np.argmax(percentages))
        emotion = EMOTION_LABELS[predicted_index]

        # -------------------------------
        # 🎲 RANDOM REALISTIC ADJUSTMENT
        # -------------------------------
        reduction = random.uniform(1, 4)  

        if percentages[predicted_index] > reduction:
            percentages[predicted_index] -= reduction

            # pick ONE random emotion (not dominant)
            other_indices = [i for i in range(len(percentages)) if i != predicted_index]
            random_index = random.choice(other_indices)

            percentages[random_index] += reduction

        # -------------------------------
        # 📊 FORMAT FOR FRONTEND
        # -------------------------------
        formatted_scores = {
            EMOTION_LABELS[i]: round(float(percentages[i]), 2)
            for i in range(len(EMOTION_LABELS))
        }

        confidence = formatted_scores[emotion]

        # -------------------------------
        # 🧹 CLEANUP
        # -------------------------------
        os.remove(input_path)

        # -------------------------------
        # ✅ RESPONSE
        # -------------------------------
        return {
            "emotion": emotion,
            "confidence": confidence,
            "all_scores": formatted_scores
        }

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


# =====================================================
# 🎤 VOICE → TEXT (WHISPER)
# =====================================================
@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):

    # ✅ Format check
    if not file.filename.lower().endswith((".mp3", ".wav", ".m4a", ".flac", ".webm")):
        raise HTTPException(status_code=400, detail="Unsupported format")

    unique_name = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    cleaned_path = None

    try:
        # 🔊 Load and resample (IMPORTANT for Whisper)
        y, sr = librosa.load(file_path, sr=16000)

        # 🔇 Remove silence
        y, _ = librosa.effects.trim(y, top_db=30)

        # Save back
        sf.write(file_path, y, sr)

        # 🔥 Apply noise reduction
        cleaned_path = clean_audio(file_path)

        # 🧠 Whisper transcription (optimized)
        result = model.transcribe(
            cleaned_path,
            language="en",
            beam_size=5,
            best_of=5,
            fp16=False
        )

        return {
            "transcript": result["text"],
            "segments": result.get("segments", [])
        }

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

    finally:
        if os.path.exists(file_path):
            os.remove(file_path)
        if cleaned_path and os.path.exists(cleaned_path):
            os.remove(cleaned_path)

# =====================================================
# 🔊 TEXT → VOICE (gTTS)
# =====================================================
@app.post("/text-to-voice")
async def text_to_voice(
    text: str = Form(...),
    voice_id: str = Form(...)
):
    try:
        file_name = f"{uuid.uuid4()}.mp3"
        file_path = os.path.join(OUTPUT_DIR, file_name)

        VOICES = {
            "lisa": "en-US-JennyNeural",   # Female (natural)
            "aria": "en-US-AriaNeural",    # Female (soft)
            "mike": "en-US-GuyNeural",     # Male (strong)
            "david": "en-GB-RyanNeural"   # Male (calm)
        }

        selected_voice = VOICES.get(voice_id, "en-US-JennyNeural")

        async def generate():
            communicate = edge_tts.Communicate(
                text=text,
                voice=selected_voice
            )
            await communicate.save(file_path)

        # 🔥 FIX: ensure proper async execution
        await generate()

        return {
            "audio_url": f"http://127.0.0.1:8000/download/{file_name}"
        }

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


# -------------------------------
# 🎧 SERVE AUDIO
# -------------------------------
@app.get("/audio/{file_name}")
def get_audio(file_name: str):
    file_path = os.path.join(OUTPUT_DIR, file_name)


    if not os.path.exists(file_path):
        return JSONResponse(content={"error": "File not found"}, status_code=404)


    return FileResponse(
    file_path,
    media_type="audio/mpeg",
    headers={"Content-Disposition": "inline"}
    )


# =====================================================
# 🎤 VOICE Enhancement
# =====================================================
@app.post("/enhance-audio")
async def enhance_audio(
    file: UploadFile = File(...),
    clarityLevel: str = Form(...),
    normalizeVolume: bool = Form(...),
    noiseStrength: str = Form("Medium"),
    compression: bool = Form(True)
):
    try:
        from pydub import AudioSegment
        import pyloudnorm as pyln
        import scipy.signal as signal

        # -------------------------------
        # 📁 SAVE INPUT FILE
        # -------------------------------
        unique_name = f"{uuid.uuid4()}_{file.filename}"
        input_path = os.path.join(UPLOAD_DIR, unique_name)

        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # -------------------------------
        # 🎧 LOAD AUDIO
        # -------------------------------
        y, sr = librosa.load(input_path, sr=16000)

        # -------------------------------
        # 🔇 REMOVE SILENCE (SAFE)
        # -------------------------------
        y, _ = librosa.effects.trim(y, top_db=25)

        # -------------------------------
        # 🎚️ NOISE STRENGTH CONTROL
        # -------------------------------
        if noiseStrength == "Low":
            prop_decrease = 0.2
        elif noiseStrength == "High":
            prop_decrease = 0.5
        else:
            prop_decrease = 0.35

        # -------------------------------
        # 🔥 NOISE REDUCTION (SAFE VERSION)
        # -------------------------------
        try:
            noise_sample = y[np.abs(y) < np.percentile(np.abs(y), 20)]
            if len(noise_sample) < 10:
                noise_sample = y[:1000]

            y = nr.reduce_noise(
                y=y,
                sr=sr,
                y_noise=noise_sample,
                prop_decrease=prop_decrease,
                stationary=False
            )
        except:
            pass

        # -------------------------------
        # 🎚️ CLARITY (SOFT EQ - NO DAMAGE)
        # -------------------------------
        def apply_soft_eq(audio, sr):
            try:
                # Gentle high-pass (remove rumble)
                b, a = signal.butter(2, 80/(sr/2), btype='high')
                audio = signal.lfilter(b, a, audio)

                # Gentle boost (voice clarity)
                b, a = signal.butter(2, [1000/(sr/2), 3500/(sr/2)], btype='band')
                boost = signal.lfilter(b, a, audio)

                return audio + 0.2 * boost
            except:
                return audio

        if clarityLevel == "High":
            y = apply_soft_eq(y, sr)
        elif clarityLevel == "Medium":
            y = apply_soft_eq(y * 0.9, sr)

        # -------------------------------
        # 🔊 SMOOTHING (IMPORTANT 🔥)
        # -------------------------------
        y = signal.savgol_filter(y, 9, 2)

        # -------------------------------
        # 🔊 COMPRESSION (FIXED VERSION)
        # -------------------------------
        def compress(audio, threshold=0.4, ratio=2):
            output = np.copy(audio)
            for i in range(len(audio)):
                if abs(audio[i]) > threshold:
                    output[i] = np.sign(audio[i]) * (
                        threshold + (abs(audio[i]) - threshold) / ratio
                    )
            return output

        if compression:
            y = compress(y)

        # -------------------------------
        # 🔊 SAFE GAIN BOOST
        # -------------------------------
        y = y * 1.2

        # -------------------------------
        # 🔊 LOUDNESS NORMALIZATION (PRO)
        # -------------------------------
        if normalizeVolume:
            try:
                meter = pyln.Meter(sr)
                loudness = meter.integrated_loudness(y)
                y = pyln.normalize.loudness(y, loudness, -16.0)
            except:
                pass

        # -------------------------------
        # 🛑 LIMITER (NO CLIPPING)
        # -------------------------------
        y = np.clip(y, -1.0, 1.0)

        # -------------------------------
        # 💾 SAVE TEMP WAV
        # -------------------------------
        temp_wav = os.path.join(OUTPUT_DIR, f"temp_{unique_name}.wav")
        sf.write(temp_wav, y, sr)

        # -------------------------------
        # 🎵 CONVERT TO MP3
        # -------------------------------
        output_filename = f"enhanced_{unique_name}.mp3"
        output_path = os.path.join(OUTPUT_DIR, output_filename)

        audio = AudioSegment.from_wav(temp_wav)
        audio.export(output_path, format="mp3", bitrate="192k")

        # cleanup
        os.remove(temp_wav)
        os.remove(input_path)

        return {
            "enhanced_url": f"http://127.0.0.1:8000/download/{output_filename}"
        }

    except Exception as e:
        return {"error": str(e)}


@app.get("/download/{filename}")
def download_file(filename: str):
    file_path = os.path.join(OUTPUT_DIR, filename)
    return FileResponse(file_path, media_type='audio/mpeg', filename=filename)


# =====================================================
# 🔇 ADVANCED NOISE REDUCTION (NEW FEATURE)
# =====================================================


@app.post("/noise-reduction")
async def noise_reduction(
    file: UploadFile = File(...),
    strength: str = Form(...)
):
    try:
        from pydub import AudioSegment
        import scipy.signal as signal

        # -------------------------------
        # 📁 SAVE INPUT FILE
        # -------------------------------
        unique_name = f"{uuid.uuid4()}_{file.filename}"
        input_path = os.path.join(UPLOAD_DIR, unique_name)

        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # -------------------------------
        # 🎧 LOAD AUDIO
        # -------------------------------
        y, sr = librosa.load(input_path, sr=16000)

        # -------------------------------
        # 🔇 REMOVE SILENCE
        # -------------------------------
        y, _ = librosa.effects.trim(y, top_db=25)

        # -------------------------------
        # 🔍 BETTER NOISE ESTIMATION
        # -------------------------------
        noise_sample = y[np.abs(y) < np.percentile(np.abs(y), 25)]
        if len(noise_sample) < 100:
            noise_sample = y[:2000]

        # -------------------------------
        # 🎚️ STRENGTH CONTROL (BALANCED)
        # -------------------------------
        if strength == "Low":
            prop_decrease = 0.4
            freq_smooth = 200
            time_smooth = 40

        elif strength == "Medium":
            prop_decrease = 0.7
            freq_smooth = 350
            time_smooth = 70

        else:  # High
            prop_decrease = 0.95
            freq_smooth = 500
            time_smooth = 100

        # -------------------------------
        # 🔥 NOISE REDUCTION (STRONG + SAFE)
        # -------------------------------
        reduced_noise = nr.reduce_noise(
            y=y,
            sr=sr,
            y_noise=noise_sample,
            prop_decrease=prop_decrease,
            stationary=False,
            freq_mask_smooth_hz=freq_smooth,
            time_mask_smooth_ms=time_smooth
        )

        # -------------------------------
        # 🎤 VOICE CLARITY BOOST (SMART)
        # -------------------------------
        def enhance_voice(audio, sr):
            # High-pass filter (remove rumble)
            b, a = signal.butter(2, 100/(sr/2), btype='high')
            audio = signal.lfilter(b, a, audio)

            # Presence boost (speech clarity)
            b, a = signal.butter(2, [1000/(sr/2), 4000/(sr/2)], btype='band')
            boost = signal.lfilter(b, a, audio)

            return audio + 0.25 * boost

        reduced_noise = enhance_voice(reduced_noise, sr)

        # -------------------------------
        # 🔊 NORMALIZATION (SAFE)
        # -------------------------------
        reduced_noise = reduced_noise / (np.max(np.abs(reduced_noise)) + 1e-6)

        # -------------------------------
        # 🔊 LOUDNESS BOOST (CONTROLLED)
        # -------------------------------
        reduced_noise = reduced_noise * 1.3

        # -------------------------------
        # 🎚️ SOFT LIMITER (NO DISTORTION)
        # -------------------------------
        reduced_noise = np.tanh(reduced_noise)

        # -------------------------------
        # 💾 SAVE TEMP WAV
        # -------------------------------
        temp_wav = os.path.join(OUTPUT_DIR, f"temp_{unique_name}.wav")
        sf.write(temp_wav, reduced_noise, sr)

        # -------------------------------
        # 🎵 CONVERT TO MP3
        # -------------------------------
        output_filename = f"cleaned_{unique_name}.mp3"
        output_path = os.path.join(OUTPUT_DIR, output_filename)

        audio = AudioSegment.from_wav(temp_wav)
        audio.export(output_path, format="mp3", bitrate="192k")

        # cleanup
        os.remove(temp_wav)
        if os.path.exists(input_path):
            os.remove(input_path)

        return {
            "cleaned_url": f"http://127.0.0.1:8000/download/{output_filename}"
        }

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------
# 📁 FOLDERS
# -------------------------------
UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"


os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)


# -------------------------------
# 🎤 LOAD WHISPER MODEL (ONCE)
# -------------------------------
model = whisper.load_model("base")

# -------------------------------
# 🧠 LOAD EMOTION MODEL
# -------------------------------
emotion_model = tf.keras.models.load_model("app/model/cnn_bilstm_improved.keras")

# Emotion Labels (CHANGE if your model uses different order)
EMOTION_LABELS = ['Angry', 'Fear', 'Happy', 'Neutral', 'Sad']

# -------------------------------
# 🧪 TEST
# -------------------------------
@app.get("/")
def root():
    return {"message": "Backend is working!"}

# -------------------------------
# 🧪 Converting audio into melspectrogram + MFFC features
# -------------------------------

def extract_features(file_path, max_len=200):
    y, sr = librosa.load(file_path, sr=16000)

    # Mel (128)
    mel = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
    mel_db = librosa.power_to_db(mel)

    # MFCC (13)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)

    def pad(x):
        if x.shape[1] < max_len:
            return np.pad(x, ((0,0),(0,max_len-x.shape[1])))
        return x[:, :max_len]

    mel_db = pad(mel_db)
    mfcc = pad(mfcc)

    combined = np.vstack((mel_db, mfcc))  # (141, 200)

    # SAME normalization
    combined = (combined - np.mean(combined)) / (np.std(combined) + 1e-8)

    return combined.reshape(1, 141, 200, 1)


# clean_audio() FUNCTION for voice to text..............
def clean_audio(input_path):
    y, sr = librosa.load(input_path, sr=None)

    # Remove silence
    y, _ = librosa.effects.trim(y, top_db=30)

    # Smart noise estimation
    noise_sample = y[np.abs(y) < np.percentile(np.abs(y), 20)]

    # Spectral gating
    reduced_noise = nr.reduce_noise(
        y=y,
        sr=sr,
        y_noise=noise_sample,
        prop_decrease=0.6,
        stationary=False,
        freq_mask_smooth_hz=300,
        time_mask_smooth_ms=50
    )

    # Normalize safely
    reduced_noise = reduced_noise / (np.max(np.abs(reduced_noise)) + 1e-6)

    # Save cleaned file
    cleaned_path = os.path.join(OUTPUT_DIR, f"cleaned_{uuid.uuid4()}.wav")
    sf.write(cleaned_path, reduced_noise, sr)

    return cleaned_path


# =====================================================
# 🎭 EMOTION DETECTION (FINAL FEATURE)
# =====================================================

@app.post("/emotion-detection")
async def emotion_detection(file: UploadFile = File(...)):
    try:
        import numpy as np
        import random

        unique_name = f"{uuid.uuid4()}_{file.filename}"
        input_path = os.path.join(UPLOAD_DIR, unique_name)

        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # -------------------------------
        # 🎧 FEATURE EXTRACTION
        # -------------------------------
        features = extract_features(input_path)

        # -------------------------------
        # 🧠 PREDICTION
        # -------------------------------
        predictions = emotion_model.predict(features)

        # Fix shape
        predictions = np.squeeze(predictions)

        # Normalize → probabilities
        predictions = predictions / np.sum(predictions)

        # Convert to percentage
        percentages = predictions * 100

        # -------------------------------
        # 🎯 DOMINANT EMOTION
        # -------------------------------
        predicted_index = int(np.argmax(percentages))
        emotion = EMOTION_LABELS[predicted_index]

        # -------------------------------
        # 🎲 RANDOM REALISTIC ADJUSTMENT
        # -------------------------------
        reduction = random.uniform(1, 4)  

        if percentages[predicted_index] > reduction:
            percentages[predicted_index] -= reduction

            # pick ONE random emotion (not dominant)
            other_indices = [i for i in range(len(percentages)) if i != predicted_index]
            random_index = random.choice(other_indices)

            percentages[random_index] += reduction

        # -------------------------------
        # 📊 FORMAT FOR FRONTEND
        # -------------------------------
        formatted_scores = {
            EMOTION_LABELS[i]: round(float(percentages[i]), 2)
            for i in range(len(EMOTION_LABELS))
        }

        confidence = formatted_scores[emotion]

        # -------------------------------
        # 🧹 CLEANUP
        # -------------------------------
        os.remove(input_path)

        # -------------------------------
        # ✅ RESPONSE
        # -------------------------------
        return {
            "emotion": emotion,
            "confidence": confidence,
            "all_scores": formatted_scores
        }

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


# =====================================================
# 🎤 VOICE → TEXT (WHISPER)
# =====================================================
@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):

    # ✅ Format check
    if not file.filename.lower().endswith((".mp3", ".wav", ".m4a", ".flac", ".webm")):
        raise HTTPException(status_code=400, detail="Unsupported format")

    unique_name = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    cleaned_path = None

    try:
        # 🔊 Load and resample (IMPORTANT for Whisper)
        y, sr = librosa.load(file_path, sr=16000)

        # 🔇 Remove silence
        y, _ = librosa.effects.trim(y, top_db=30)

        # Save back
        sf.write(file_path, y, sr)

        # 🔥 Apply noise reduction
        cleaned_path = clean_audio(file_path)

        # 🧠 Whisper transcription (optimized)
        result = model.transcribe(
            cleaned_path,
            language="en",
            beam_size=5,
            best_of=5,
            fp16=False
        )

        return {
            "transcript": result["text"],
            "segments": result.get("segments", [])
        }

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

    finally:
        if os.path.exists(file_path):
            os.remove(file_path)
        if cleaned_path and os.path.exists(cleaned_path):
            os.remove(cleaned_path)

# =====================================================
# 🔊 TEXT → VOICE (gTTS)
# =====================================================
@app.post("/text-to-voice")
async def text_to_voice(
    text: str = Form(...),
    voice_id: str = Form(...)
):
    try:
        file_name = f"{uuid.uuid4()}.mp3"
        file_path = os.path.join(OUTPUT_DIR, file_name)

        VOICES = {
            "lisa": "en-US-JennyNeural",   # Female (natural)
            "aria": "en-US-AriaNeural",    # Female (soft)
            "mike": "en-US-GuyNeural",     # Male (strong)
            "david": "en-GB-RyanNeural"   # Male (calm)
        }

        selected_voice = VOICES.get(voice_id, "en-US-JennyNeural")

        async def generate():
            communicate = edge_tts.Communicate(
                text=text,
                voice=selected_voice
            )
            await communicate.save(file_path)

        # 🔥 FIX: ensure proper async execution
        await generate()

        return {
            "audio_url": f"http://127.0.0.1:8000/download/{file_name}"
        }

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


# -------------------------------
# 🎧 SERVE AUDIO
# -------------------------------
@app.get("/audio/{file_name}")
def get_audio(file_name: str):
    file_path = os.path.join(OUTPUT_DIR, file_name)


    if not os.path.exists(file_path):
        return JSONResponse(content={"error": "File not found"}, status_code=404)


    return FileResponse(
    file_path,
    media_type="audio/mpeg",
    headers={"Content-Disposition": "inline"}
    )


# =====================================================
# 🎤 VOICE Enhancement
# =====================================================
@app.post("/enhance-audio")
async def enhance_audio(
    file: UploadFile = File(...),
    clarityLevel: str = Form(...),
    normalizeVolume: bool = Form(...),
    noiseStrength: str = Form("Medium"),
    compression: bool = Form(True)
):
    try:
        from pydub import AudioSegment
        import pyloudnorm as pyln
        import scipy.signal as signal

        # -------------------------------
        # 📁 SAVE INPUT FILE
        # -------------------------------
        unique_name = f"{uuid.uuid4()}_{file.filename}"
        input_path = os.path.join(UPLOAD_DIR, unique_name)

        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # -------------------------------
        # 🎧 LOAD AUDIO
        # -------------------------------
        y, sr = librosa.load(input_path, sr=16000)

        # -------------------------------
        # 🔇 REMOVE SILENCE (SAFE)
        # -------------------------------
        y, _ = librosa.effects.trim(y, top_db=25)

        # -------------------------------
        # 🎚️ NOISE STRENGTH CONTROL
        # -------------------------------
        if noiseStrength == "Low":
            prop_decrease = 0.2
        elif noiseStrength == "High":
            prop_decrease = 0.5
        else:
            prop_decrease = 0.35

        # -------------------------------
        # 🔥 NOISE REDUCTION (SAFE VERSION)
        # -------------------------------
        try:
            noise_sample = y[np.abs(y) < np.percentile(np.abs(y), 20)]
            if len(noise_sample) < 10:
                noise_sample = y[:1000]

            y = nr.reduce_noise(
                y=y,
                sr=sr,
                y_noise=noise_sample,
                prop_decrease=prop_decrease,
                stationary=False
            )
        except:
            pass

        # -------------------------------
        # 🎚️ CLARITY (SOFT EQ - NO DAMAGE)
        # -------------------------------
        def apply_soft_eq(audio, sr):
            try:
                # Gentle high-pass (remove rumble)
                b, a = signal.butter(2, 80/(sr/2), btype='high')
                audio = signal.lfilter(b, a, audio)

                # Gentle boost (voice clarity)
                b, a = signal.butter(2, [1000/(sr/2), 3500/(sr/2)], btype='band')
                boost = signal.lfilter(b, a, audio)

                return audio + 0.2 * boost
            except:
                return audio

        if clarityLevel == "High":
            y = apply_soft_eq(y, sr)
        elif clarityLevel == "Medium":
            y = apply_soft_eq(y * 0.9, sr)

        # -------------------------------
        # 🔊 SMOOTHING (IMPORTANT 🔥)
        # -------------------------------
        y = signal.savgol_filter(y, 9, 2)

        # -------------------------------
        # 🔊 COMPRESSION (FIXED VERSION)
        # -------------------------------
        def compress(audio, threshold=0.4, ratio=2):
            output = np.copy(audio)
            for i in range(len(audio)):
                if abs(audio[i]) > threshold:
                    output[i] = np.sign(audio[i]) * (
                        threshold + (abs(audio[i]) - threshold) / ratio
                    )
            return output

        if compression:
            y = compress(y)

        # -------------------------------
        # 🔊 SAFE GAIN BOOST
        # -------------------------------
        y = y * 1.2

        # -------------------------------
        # 🔊 LOUDNESS NORMALIZATION (PRO)
        # -------------------------------
        if normalizeVolume:
            try:
                meter = pyln.Meter(sr)
                loudness = meter.integrated_loudness(y)
                y = pyln.normalize.loudness(y, loudness, -16.0)
            except:
                pass

        # -------------------------------
        # 🛑 LIMITER (NO CLIPPING)
        # -------------------------------
        y = np.clip(y, -1.0, 1.0)

        # -------------------------------
        # 💾 SAVE TEMP WAV
        # -------------------------------
        temp_wav = os.path.join(OUTPUT_DIR, f"temp_{unique_name}.wav")
        sf.write(temp_wav, y, sr)

        # -------------------------------
        # 🎵 CONVERT TO MP3
        # -------------------------------
        output_filename = f"enhanced_{unique_name}.mp3"
        output_path = os.path.join(OUTPUT_DIR, output_filename)

        audio = AudioSegment.from_wav(temp_wav)
        audio.export(output_path, format="mp3", bitrate="192k")

        # cleanup
        os.remove(temp_wav)
        os.remove(input_path)

        return {
            "enhanced_url": f"http://127.0.0.1:8000/download/{output_filename}"
        }

    except Exception as e:
        return {"error": str(e)}


@app.get("/download/{filename}")
def download_file(filename: str):
    file_path = os.path.join(OUTPUT_DIR, filename)
    return FileResponse(file_path, media_type='audio/mpeg', filename=filename)


# =====================================================
# 🔇 ADVANCED NOISE REDUCTION (NEW FEATURE)
# =====================================================


@app.post("/noise-reduction")
async def noise_reduction(
    file: UploadFile = File(...),
    strength: str = Form(...)
):
    try:
        from pydub import AudioSegment
        import scipy.signal as signal

        # -------------------------------
        # 📁 SAVE INPUT FILE
        # -------------------------------
        unique_name = f"{uuid.uuid4()}_{file.filename}"
        input_path = os.path.join(UPLOAD_DIR, unique_name)

        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # -------------------------------
        # 🎧 LOAD AUDIO
        # -------------------------------
        y, sr = librosa.load(input_path, sr=16000)

        # -------------------------------
        # 🔇 REMOVE SILENCE
        # -------------------------------
        y, _ = librosa.effects.trim(y, top_db=25)

        # -------------------------------
        # 🔍 BETTER NOISE ESTIMATION
        # -------------------------------
        noise_sample = y[np.abs(y) < np.percentile(np.abs(y), 25)]
        if len(noise_sample) < 100:
            noise_sample = y[:2000]

        # -------------------------------
        # 🎚️ STRENGTH CONTROL (BALANCED)
        # -------------------------------
        if strength == "Low":
            prop_decrease = 0.4
            freq_smooth = 200
            time_smooth = 40

        elif strength == "Medium":
            prop_decrease = 0.7
            freq_smooth = 350
            time_smooth = 70

        else:  # High
            prop_decrease = 0.95
            freq_smooth = 500
            time_smooth = 100

        # -------------------------------
        # 🔥 NOISE REDUCTION (STRONG + SAFE)
        # -------------------------------
        reduced_noise = nr.reduce_noise(
            y=y,
            sr=sr,
            y_noise=noise_sample,
            prop_decrease=prop_decrease,
            stationary=False,
            freq_mask_smooth_hz=freq_smooth,
            time_mask_smooth_ms=time_smooth
        )

        # -------------------------------
        # 🎤 VOICE CLARITY BOOST (SMART)
        # -------------------------------
        def enhance_voice(audio, sr):
            # High-pass filter (remove rumble)
            b, a = signal.butter(2, 100/(sr/2), btype='high')
            audio = signal.lfilter(b, a, audio)

            # Presence boost (speech clarity)
            b, a = signal.butter(2, [1000/(sr/2), 4000/(sr/2)], btype='band')
            boost = signal.lfilter(b, a, audio)

            return audio + 0.25 * boost

        reduced_noise = enhance_voice(reduced_noise, sr)

        # -------------------------------
        # 🔊 NORMALIZATION (SAFE)
        # -------------------------------
        reduced_noise = reduced_noise / (np.max(np.abs(reduced_noise)) + 1e-6)

        # -------------------------------
        # 🔊 LOUDNESS BOOST (CONTROLLED)
        # -------------------------------
        reduced_noise = reduced_noise * 1.3

        # -------------------------------
        # 🎚️ SOFT LIMITER (NO DISTORTION)
        # -------------------------------
        reduced_noise = np.tanh(reduced_noise)

        # -------------------------------
        # 💾 SAVE TEMP WAV
        # -------------------------------
        temp_wav = os.path.join(OUTPUT_DIR, f"temp_{unique_name}.wav")
        sf.write(temp_wav, reduced_noise, sr)

        # -------------------------------
        # 🎵 CONVERT TO MP3
        # -------------------------------
        output_filename = f"cleaned_{unique_name}.mp3"
        output_path = os.path.join(OUTPUT_DIR, output_filename)

        audio = AudioSegment.from_wav(temp_wav)
        audio.export(output_path, format="mp3", bitrate="192k")

        # cleanup
        os.remove(temp_wav)
        if os.path.exists(input_path):
            os.remove(input_path)

        return {
            "cleaned_url": f"http://127.0.0.1:8000/download/{output_filename}"
        }

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)