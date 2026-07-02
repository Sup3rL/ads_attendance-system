document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            // Prevent the browser from refreshing the page
            e.preventDefault();

            console.log("Login button clicked! Intercepted by Vanilla JS.");
            
            // In a future milestone, we will gather the username and password here
            // and use fetch() to send them to the Go backend.
            
            alert("Frontend architecture is working! Ready to connect to backend login logic.");
        });
    }
});