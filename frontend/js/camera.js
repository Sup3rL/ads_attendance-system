document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('videoElement');
    const endSessionBtn = document.getElementById('endSessionBtn');

    // Function to start the webcam
    async function startVideo() {
        try {
            // Request access to the video camera only (no audio needed)
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            
            // If the user grants permission, attach the stream to our HTML video tag
            video.srcObject = stream;
            
            console.log("Webcam successfully initialized.");
        } catch (err) {
            // This triggers if the user clicks "Block" or if no camera is plugged in
            console.error("Error accessing the webcam: ", err);
            alert("Cannot access the webcam. Please ensure it is connected and permissions are granted.");
        }
    }

    // Stop the camera when the session ends
    endSessionBtn.addEventListener('click', () => {
        const stream = video.srcObject;
        if (stream) {
            // A stream consists of "tracks" (video track, audio track). We must stop all of them.
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
        }
        alert("Attendance session ended. Camera turned off.");
        // In the future, this will redirect back to the dashboard
    });

    // Initialize the camera immediately when the page loads
    startVideo();
});