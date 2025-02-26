document.getElementById('audio-upload').addEventListener('change', async function(event) {
    try {
        // Grab the uploaded audio file from the form like a ninja.
        const formData = new FormData(document.getElementById('upload-form'));
        // Send it off to the server's `/transcribe` endpoint for some Whisper magic.
        const response = await fetch('/transcribe', {
            method: 'POST',
            body: formData
        });
        // Let's see what the AI brain came up with.
        const result = await response.json();
        if (response.ok) {
            // Display the transcribed text like it's hot.
            document.getElementById('transcription').textContent = result.transcription;
            // And show the translated version, because why not?
            document.getElementById('translation').textContent = result.translation;
        } else {
            // Uh oh, something went wrong. Spill the beans.
            document.getElementById('result').textContent = result.error;
        }
    } catch (error) {
        // Total system failure on upload! Alert!
        document.getElementById('result').textContent = 'An error occurred while uploading the file.';
    }
});

let mediaRecorder;
let audioChunks = [];

document.getElementById('record-btn').addEventListener('click', async function() {
    try {
        // Fire up the microphone like a boss!
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();
        // Let the user know they're being recorded, the spotlight is on them.
        document.getElementById('record-status').textContent = 'Recording...';
        // Hide the record button, show the stop button. Simple UI magic.
        document.getElementById('record-btn').classList.add('hidden');
        document.getElementById('stop-btn').classList.remove('hidden');
        // Show our fancy animation, make it look cool.
        document.getElementById('speech-animation').classList.remove('hidden');

        mediaRecorder.ondataavailable = function(event) {
            // Collect audio data in chunks, like saving memories.
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async function() {
            try {
                // Assemble the audio chunks into one beautiful blob.
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const formData = new FormData();
                // Add the recording to the form.
                formData.append('audio', audioBlob, 'recording.wav');

                // Send the recording to the server for processing, it is showtime!
                const response = await fetch('/transcribe', {
                    method: 'POST',
                    body: formData
                });
                // Let's see what Whisper did with our voice.
                const result = await response.json();
                if (response.ok) {
                    // Display the transcription and translation, mission success.
                    document.getElementById('transcription').textContent = result.transcription;
                    document.getElementById('translation').textContent = result.translation;
                } else {
                    // Server rejected us, show the error message.
                    document.getElementById('result').textContent = result.error;
                }
            } catch (error) {
                // Something went terribly wrong with the recording.
                document.getElementById('result').textContent = 'An error occurred while processing the recording.';
            } finally {
                // Reset everything and be ready to record again.
                audioChunks = [];
                document.getElementById('record-status').textContent = '';
                document.getElementById('record-btn').classList.remove('hidden');
                document.getElementById('stop-btn').classList.add('hidden');
                document.getElementById('speech-animation').classList.add('hidden');
            }
        };
    } catch (error) {
        // Microphone access denied! Panic!
        document.getElementById('result').textContent = 'An error occurred while accessing the microphone.';
    }
});

document.getElementById('stop-btn').addEventListener('click', function() {
    // Stop the recording, time to wrap things up.
    mediaRecorder.stop();
});
