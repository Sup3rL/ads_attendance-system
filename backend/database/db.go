package database

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

// DB is a global variable holding our database connection pool.
// Capitalizing the first letter 'D' makes it "exported" (public) so other packages can use it.
var DB *pgxpool.Pool

// Connect initializes the database pool and verifies the connection.
func Connect() {
	// 1. Load variables from the .env file into the system
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file. Are you sure it exists in the root directory?")
	}

	// 2. Retrieve the connection string
	dbURL := os.Getenv("DB_URL")
	if dbURL == "" {
		log.Fatal("DB_URL environment variable is empty or not set.")
	}

	// 3. Create the connection pool
	pool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Unable to create database connection pool: %v\n", err)
	}

	// 4. Ping the database to guarantee it is actively listening
	err = pool.Ping(context.Background())
	if err != nil {
		log.Fatalf("Database is not responding to ping: %v\n", err)
	}

	// 5. Assign the successful pool to our global DB variable
	DB = pool
	fmt.Println("✅ Successfully connected to the PostgreSQL database!")
}
