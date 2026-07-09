package handlers

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/Sup3rL/ads_attendance-system/backend/database"
)

// RegisterRequest defines the exact JSON structure we expect from the frontend.
type RegisterRequest struct {
	NIM        string    `json:"nim"`
	Name       string    `json:"name"`
	Descriptor []float32 `json:"descriptor"` // The 128 numbers
}

// RegisterStudent handles the POST request to register a new face
func RegisterStudent(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// 1. Decode the incoming JSON from the frontend
	var req RegisterRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, `{"error": "Invalid JSON format"}`, http.StatusBadRequest)
		return
	}

	// 2. Start a Database Transaction
	// context.Background() is used because this request shouldn't timeout under normal conditions
	tx, err := database.DB.Begin(context.Background())
	if err != nil {
		http.Error(w, `{"error": "Failed to start database transaction"}`, http.StatusInternalServerError)
		return
	}
	// defer Rollback ensures that if the function crashes, the transaction is canceled safely
	defer tx.Rollback(context.Background())

	// 3. Insert the Student and get their generated ID
	var studentID int
	studentQuery := `INSERT INTO students (nim, name) VALUES ($1, $2) RETURNING id`
	err = tx.QueryRow(context.Background(), studentQuery, req.NIM, req.Name).Scan(&studentID)
	if err != nil {
		http.Error(w, `{"error": "Failed to create student. NIM might already exist."}`, http.StatusConflict)
		return
	}

	// 4. Insert the Face Descriptor
	// pgx automatically converts our []float32 array into a format suitable for PostgreSQL's JSONB column
	descriptorQuery := `INSERT INTO face_descriptors (student_id, descriptor) VALUES ($1, $2)`
	_, err = tx.Exec(context.Background(), descriptorQuery, studentID, req.Descriptor)
	if err != nil {
		http.Error(w, `{"error": "Failed to save face descriptor"}`, http.StatusInternalServerError)
		return
	}

	// 5. Commit the Transaction (Save permanently)
	err = tx.Commit(context.Background())
	if err != nil {
		http.Error(w, `{"error": "Failed to commit transaction"}`, http.StatusInternalServerError)
		return
	}

	// 6. Send Success Response
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "Student and face registered successfully!",
	})
}
