package routes

import (
	"net/http" // Add this import for the FileServer

	"github.com/Sup3rL/ads_attendance-system/backend/handlers"
	"github.com/gorilla/mux"
)

func SetupRoutes() *mux.Router {
	r := mux.NewRouter()

	// API Routes
	api := r.PathPrefix("/api").Subrouter()
	api.HandleFunc("/health", handlers.HealthCheck).Methods("GET")

	api.HandleFunc("/students/register", handlers.RegisterStudent).Methods("POST")

	api.HandleFunc("/attendance/scan", handlers.RecognizeFace).Methods("POST")

	// Add this to your SetupRoutes function in backend/routes/routes.go
	api.HandleFunc("/attendance/record", handlers.RecordAttendance).Methods("POST")
	// --- NEW CODE: Serve Frontend Static Files ---
	// This tells Go: "If a request doesn't start with /api, look in the /frontend folder for matching files."
	staticDir := "./frontend"
	r.PathPrefix("/").Handler(http.FileServer(http.Dir(staticDir)))

	return r
}
