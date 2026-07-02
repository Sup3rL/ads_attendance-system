package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/Sup3rL/ads_attendance-system/backend/database"
	"github.com/Sup3rL/ads_attendance-system/backend/routes"
)

func main() {
	fmt.Println("Starting Attendance System Backend...")

	// 1. Connect to PostgreSQL
	database.Connect()
	defer database.DB.Close()

	// 2. Initialize the router
	router := routes.SetupRoutes()

	// 3. Start the HTTP server
	port := ":8081"
	fmt.Printf("🚀 Server is running on http://localhost%s\n", port)

	// ListenAndServe blocks forever, keeping the server alive and listening for requests.
	// If it fails (e.g., port is already in use), log.Fatal will crash the program and print the error.
	err := http.ListenAndServe(port, router)
	if err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
