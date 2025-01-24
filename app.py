import os
from flask import Flask, request, render_template, jsonify
import torch
import whisper

app = Flask(__name__)

# Load the Whisper model
model = whisper.load_model("base", device="cuda" if torch.cuda.is_available() else "cpu")

# Ensure upload folder exists
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def transcribe_audio(file):
    options = dict(task="transcribe", best_of=5)
    text = model.transcribe(file, **options)["text"]
    return text.strip()

def translate_audio(file):
    options = dict(task="translate", best_of=5)
    text = model.transcribe(file, **options)["text"]
    return text.strip()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'audio' in request.files:
        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({"error": "Empty file."}), 400

        # Save the uploaded file
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], audio_file.filename)
        audio_file.save(file_path)
    elif request.data:
        # Save the audio data from microphone input
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], 'mic_input.wav')
        with open(file_path, 'wb') as f:
            f.write(request.data)
    else:
        return jsonify({"error": "No audio input provided."}), 400

    # Transcribe and translate the audio
    try:
        transcription = transcribe_audio(file_path)
        translation = translate_audio(file_path)
        return jsonify({"transcription": transcription, "translation": translation})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        # Clean up the uploaded file
        os.remove(file_path)

if __name__ == '__main__':
    app.run(debug=True)