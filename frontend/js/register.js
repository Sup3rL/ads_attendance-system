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

    // 3. Capture Face and Generate Descriptor
    captureBtn.addEventListener('click', async () => {
        const nim = nimInput.value.trim();
        const name = nameInput.value.trim();

        // Basic validation
        if (!nim || !name) {
            alert("Please enter both NIM and Name before capturing.");
            return;
        }

        statusMessage.innerText = "Scanning face... Please hold still.";
        statusMessage.className = "status-waiting";
        captureBtn.disabled = true;

        try {
            // THE CORE AI LOGIC: 
            // Detect one face -> find landmarks -> generate descriptor
            const detection = await faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor();

            if (!detection) {
                statusMessage.innerText = "No face detected. Try again.";
                statusMessage.style.color = "var(--error-color)";
                captureBtn.disabled = false;
                return;
            }

            // The descriptor is a Float32Array. We convert it to a standard JavaScript Array 
            // so we can eventually turn it into JSON to send to our Go backend.
            const descriptorArray = Array.from(detection.descriptor);

            console.log("Student Data:", { nim, name });
            console.log("Generated Descriptor (128 values):", descriptorArray);

            statusMessage.innerText = "Face captured successfully! (Check Console)";
            statusMessage.className = "status-success";
            
            // In Milestone 16, we will replace the console.log with a fetch() request to Go.

        } catch (error) {
            console.error("Error during face capture:", error);
            statusMessage.innerText = "An error occurred during capture.";
            captureBtn.disabled = false;
        }
    });

    // Initialize
    loadModels();
});