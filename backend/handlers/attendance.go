package handlers

import (
	"encoding/json"
	"fmt"
	"math"
	"net/http"

	"github.com/Sup3rL/ads_attendance-system/backend/database"
)

type ScanRequest struct {
	Descriptor []float32 `json:"descriptor"`
}

// FindMatch calculates the Euclidean distance between two 128-dimensional arrays
func CalculateDistance(a, b []float32) float64 {
	var sum float64
	for i := range a {
		diff := float64(a[i] - b[i])
		sum += diff * diff
	}
	return math.Sqrt(sum)
}

func RecognizeFace(w http.ResponseWriter, r *http.Request) {
	var req ScanRequest
	json.NewDecoder(r.Body).Decode(&req)

	// 1. Fetch ALL registered descriptors from DB
	rows, _ := database.DB.Query(r.Context(), "SELECT student_id, descriptor FROM face_descriptors")
	defer rows.Close()

	var bestMatchID int = -1
	var minDistance float64 = 1.0 // Threshold: Distance must be < 0.6

	for rows.Next() {
		var id int
		var desc []float32
		rows.Scan(&id, &desc)

		dist := CalculateDistance(req.Descriptor, desc)
		if dist < minDistance {
			minDistance = dist
			bestMatchID = id
		}
	}

	// 2. Respond with the match result
	w.Header().Set("Content-Type", "application/json")
	if bestMatchID != -1 && minDistance < 0.6 {
		json.NewEncoder(w).Encode(map[string]interface{}{"match": true, "student_id": bestMatchID})
	} else {
		json.NewEncoder(w).Encode(map[string]interface{}{"match": false})
	}
}

func RecordAttendance(w http.ResponseWriter, r *http.Request) {
	var req struct {
		StudentID int `json:"student_id"`
	}

	// Log the request to see if it even arrives
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		fmt.Println("Error decoding request:", err) // Need to import "fmt"
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	fmt.Printf("Attempting to record attendance for Student ID: %d\n", req.StudentID)

	query := `INSERT INTO attendance_records (session_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`
	_, err = database.DB.Exec(r.Context(), query, 1, req.StudentID)

	if err != nil {
		fmt.Println("Database error:", err)
		http.Error(w, "Failed to record", http.StatusInternalServerError)
		return
	}

	fmt.Println("Successfully recorded attendance!")
	w.WriteHeader(http.StatusOK)
}
