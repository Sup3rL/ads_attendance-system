package handlers

import (
	"encoding/json"
	"net/http"
)

// HealthResponse defines the structure of our JSON output.
// The tags like `json:"status"` tell Go exactly how to name the keys when converting to JSON.
type HealthResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
}

// HealthCheck is the function that handles requests to our health endpoint.
func HealthCheck(w http.ResponseWriter, r *http.Request) {
	// 1. Tell the client (browser/frontend) to expect JSON data, not plain HTML.
	w.Header().Set("Content-Type", "application/json")

	// 2. Set the HTTP status code to 200 OK.
	w.WriteHeader(http.StatusOK)

	// 3. Create our response data.
	response := HealthResponse{
		Status:  "success",
		Message: "Attendance System API is running smoothly!",
	}

	// 4. Convert the Go struct into JSON and send it through the ResponseWriter.
	json.NewEncoder(w).Encode(response)
}
