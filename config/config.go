package config

import (
	"os"
	"strconv"
)

type Config struct {
	Host     string
	Port     int
	Database Database
}

type Database struct {
	Host     string
	Port     int
	User     string
	Password string
	Name     string
}

func NewConfig() *Config {
	return &Config{
		Host: getEnv("HOST", "localhost"),
		Port: getEnvAsInt("PORT", 8080),
		Database: Database{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnvAsInt("DB_PORT", 5432),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "password"),
			Name:     getEnv("DB_NAME", "alemjobs"),
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	valueStr := os.Getenv(key)
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultValue
}
