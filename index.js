
document.getElementById('audio-upload').addEventListener('change', async function (event) {
    try {
        const formData = new FormData(document.getElementById('upload-form'));
        const response = await fetch('/transcribe', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (response.ok) {
            document.getElementById('transcription').textContent = result.transcription;
            document.getElementById('translation').textContent = result.translation;
        } else {
            document.getElementById('result').textContent = result.error;
        }
    } catch (error) {
        document.getElementById('result').textContent = 'An error occurred while uploading the file.';
    }
});

let mediaRecorder;
let audioChunks = [];

document.getElementById('record-btn').addEventListener('click', async function () {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();
        // document.getElementById('record-status').textContent = 'Recording...';
        document.getElementById('record-btn').classList.add('hidden');
        document.getElementById('stop-btn').classList.remove('hidden');
        document.getElementById('speech-animation').classList.remove('hidden');

        mediaRecorder.ondataavailable = function (event) {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async function () {
            try {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const formData = new FormData();
                formData.append('audio', audioBlob, 'recording.wav');

                const response = await fetch('/transcribe', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                if (response.ok) {
                    document.getElementById('transcription').textContent = result.transcription;
                    document.getElementById('translation').textContent = result.translation;
                } else {
                    document.getElementById('result').textContent = result.error;
                }
            } catch (error) {
                document.getElementById('result').textContent = 'An error occurred while processing the recording.';
            } finally {
                audioChunks = [];
                document.getElementById('record-status').textContent = '';
                document.getElementById('record-btn').classList.remove('hidden');
                document.getElementById('stop-btn').classList.add('hidden');
                document.getElementById('speech-animation').classList.add('hidden');
            }
        };
    } catch (error) {
        document.getElementById('result').textContent = 'An error occurred while accessing the microphone.';
    }
});

document.getElementById('stop-btn').addEventListener('click', function () {
    mediaRecorder.stop();
});
