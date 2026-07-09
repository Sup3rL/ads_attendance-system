document.addEventListener('DOMContentLoaded', async () => {
    const video = document.getElementById('videoElement');
    const endSessionBtn = document.getElementById('endSessionBtn');
    const statusMessage = document.getElementById('statusMessage');

    const MODEL_URL = '/models';

    // 1. Load Models
    async function loadModels() {
        statusMessage.innerText = "Loading AI Models into memory...";
        try {
            await Promise.all([
                faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
            ]);
            startVideo();
        } catch (error) {
            console.error("Error loading models:", error);
            statusMessage.innerText = "Error loading AI models.";
        }
    }

    // 2. Start Camera
    async function startVideo() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            
            video.addEventListener('play', () => {
                statusMessage.innerText = "System Ready. Searching for face...";
                statusMessage.className = "status-success";

                // 3. Recognition Loop
                setInterval(async () => {
                    // Lowering threshold to 0.35 to help with lighting issues
                    const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.35 });
                    const detection = await faceapi.detectSingleFace(video, options).withFaceLandmarks().withFaceDescriptor();
                    
                    if (detection) {
                        console.log("Face detected! Sending to backend...");
                        const response = await fetch('/api/attendance/scan', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ descriptor: Array.from(detection.descriptor) })
                        });
                        
                        const result = await response.json();
                        if (result.match) {
                            statusMessage.innerText = "Match Found! Recording attendance...";
                            
                            // Call the new record endpoint
                            await fetch('/api/attendance/record', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ student_id: result.student_id })
                            });
                            
                            statusMessage.innerText = "Attendance Recorded for Student ID: " + result.student_id;
                        }else {
                            statusMessage.innerText = "Face recognized, but not registered.";
                            console.log("❌ Face recognized, but NO match in database.");
                        }
                    } else {
                        console.log("... Searching for face ...");
                    }
                }, 2000); // Scan every 2 seconds
            });

        } catch (err) {
            console.error("Error accessing webcam:", err);
            statusMessage.innerText = "Webcam access denied.";
        }
    }

    // Stop camera
    endSessionBtn.addEventListener('click', () => {
        const stream = video.srcObject;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        statusMessage.innerText = "Session Ended.";
    });

    loadModels();
});