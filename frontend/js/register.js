document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('videoElement');
    const captureBtn = document.getElementById('captureBtn');
    const statusMessage = document.getElementById('statusMessage');
    const nimInput = document.getElementById('nim');
    const nameInput = document.getElementById('name');

    const MODEL_URL = '/models';

    // 1. Load Models
    async function loadModels() {
        try {
            await Promise.all([
                faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
            ]);
            startVideo();
        } catch (error) {
            console.error(error);
            statusMessage.innerText = "Failed to load models.";
            statusMessage.style.color = "var(--error-color)";
        }
    }

    // 2. Start Camera
    async function startVideo() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            
            video.addEventListener('play', () => {
                statusMessage.innerText = "System Ready. Position face in frame.";
                statusMessage.className = "status-success";
                captureBtn.disabled = false; // Enable the capture button
            });
        } catch (err) {
            console.error(err);
            statusMessage.innerText = "Webcam access denied.";
        }
    }

    captureBtn.addEventListener('click', async () => {
        const nim = nimInput.value.trim();
        const name = nameInput.value.trim();

        if (!nim || !name) {
            alert("Please enter both NIM and Name before capturing.");
            return;
        }

        statusMessage.innerText = "Scanning face... Please hold still.";
        statusMessage.className = "status-waiting";
        captureBtn.disabled = true;

        try {
            // 1. Detect face
            const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.35 });
            const detection = await faceapi.detectSingleFace(video, options).withFaceLandmarks().withFaceDescriptor();

            if (!detection) {
                statusMessage.innerText = "No face detected. Try again.";
                statusMessage.style.color = "var(--error-color)";
                captureBtn.disabled = false;
                return;
            }

            // 2. Define descriptorArray IN THE SAME SCOPE as the fetch
            const descriptorArray = Array.from(detection.descriptor);

            statusMessage.innerText = "Saving to database... Please wait.";
            statusMessage.className = "status-waiting";

            // 3. Now fetch() can see descriptorArray
            const response = await fetch('/api/students/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nim: nim,
                    name: name,
                    descriptor: descriptorArray
                })
            });

            const result = await response.json();

            if (response.ok) {
                statusMessage.innerText = result.message;
                statusMessage.className = "status-success";
                nimInput.value = '';
                nameInput.value = '';
            } else {
                statusMessage.innerText = "Error: " + result.error;
                statusMessage.style.color = "var(--error-color)";
            }

        } catch (error) {
            console.error("Error during face capture:", error);
            statusMessage.innerText = "An error occurred. Check console.";
        } finally {
            captureBtn.disabled = false;
        }
    });

    // Initialize
    loadModels();
});