package database

import (
	"database/sql"
	"fmt"

	_ "github.com/go-sql-driver/mysql"
)

// Connect establishes a connection to the MySQL database
func Connect(databaseURL string) (*sql.DB, error) {
	db, err := sql.Open("mysql", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Test the connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Set connection pool settings
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)

	return db, nil
}

// Migrate runs database migrations (placeholder for now)
func Migrate(db *sql.DB) error {
	// In a real application, you would run actual migrations here
	// For now, we'll just verify the connection works
	_, err := db.Exec("SELECT 1")
	if err != nil {
		return fmt.Errorf("migration check failed: %w", err)
	}
	return nil
}
