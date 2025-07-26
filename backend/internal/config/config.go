package config

import (
	"os"
)

// Config holds application configuration
type Config struct {
	Environment    string
	DatabaseURL    string
	JWTSecret      string
	Port          string
	AllowedOrigins []string
}

// Load reads configuration from environment variables
func Load() *Config {
	return &Config{
		Environment: getEnv("ENVIRONMENT", "development"),
		DatabaseURL: getEnv("DATABASE_URL", "root:password@tcp(localhost:3306)/sck_pos?charset=utf8mb4&parseTime=True&loc=Local"),
		JWTSecret:   getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		Port:        getEnv("PORT", "8080"),
		AllowedOrigins: []string{
			getEnv("FRONTEND_URL", "http://localhost:3000"),
		},
	}
}

// getEnv returns environment variable value or default
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
