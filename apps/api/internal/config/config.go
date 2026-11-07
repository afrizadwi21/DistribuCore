package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	AppEnv       string
	Port         string
	DatabaseURL  string
	RedisURL     string
	JWTSecret    string
	JWTExpiryHrs int
	AllowedCORS  string
}

func Load() (*Config, error) {
	// Attempt to load .env from root or apps/api directory (ignore error if file not found)
	_ = godotenv.Load("../../.env")
	_ = godotenv.Load(".env")

	jwtExpiry, err := strconv.Atoi(getEnv("JWT_EXPIRATION_HOURS", "24"))
	if err != nil {
		jwtExpiry = 24
	}

	cfg := &Config{
		AppEnv:       getEnv("APP_ENV", "development"),
		Port:         getEnv("APP_PORT", "8080"),
		DatabaseURL:  getEnv("DATABASE_URL", "postgres://distribucore_user:distribucore_secret@localhost:5432/distribucore_db?sslmode=disable"),
		RedisURL:     getEnv("REDIS_URL", "redis://localhost:6379/0"),
		JWTSecret:    getEnv("JWT_SECRET", "distribucore-dev-secret-key-must-be-changed-in-production"),
		JWTExpiryHrs: jwtExpiry,
		AllowedCORS:  getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:3000"),
	}

	return cfg, nil
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
