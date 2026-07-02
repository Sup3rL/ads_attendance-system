document.addEventListener('DOMContentLoaded', async () => {
    const video = document.getElementById('videoElement');
    const endSessionBtn = document.getElementById('endSessionBtn');
    const statusMessage = document.getElementById('statusMessage');

    // 1. Define where the browser should look for the downloaded models
    const MODEL_URL = '/models';

    // 2. Load the AI Models asynchronously
    async function loadModels() {
        statusMessage.innerText = "Loading AI Models into memory... Please wait.";
        console.log("Starting model load...");

        try {
            // Promise.all ensures we wait until ALL three models finish loading
            await Promise.all([
                faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
            ]);
            
            console.log("All face-api models loaded successfully!");
            statusMessage.innerText = "Models Loaded. Starting Camera...";
            
            // Only start the video after models are fully ready
            startVideo();
        } catch (error) {
            console.error("Error loading models:", error);
            statusMessage.innerText = "Error loading AI models. Check console.";
            statusMessage.style.color = "var(--error-color)";
        }
    }

    // 3. Start the Webcam
    async function startVideo() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            
            // Wait for the video element to actually start playing before we do face detection
            video.addEventListener('play', () => {
                statusMessage.innerText = "System Ready. Waiting for face...";
                statusMessage.className = "status-success"; // Turn text green
            });

        } catch (err) {
            console.error("Error accessing the webcam: ", err);
            statusMessage.innerText = "Webcam access denied.";
        }
    }

    // Stop the camera when the session ends
    endSessionBtn.addEventListener('click', () => {
        const stream = video.srcObject;
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
        }
        statusMessage.innerText = "Session Ended.";
        statusMessage.className = "status-waiting";
    });

    // Start the process by loading models first
    loadModels();
});