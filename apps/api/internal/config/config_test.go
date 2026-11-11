package config_test

import (
	"os"
	"testing"

	"github.com/afrizadwi21/distribucore/apps/api/internal/config"
)

func TestConfigLoad_Defaults(t *testing.T) {
	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("unexpected error loading config: %v", err)
	}

	if cfg.AppEnv == "" {
		t.Errorf("expected non-empty AppEnv")
	}
	if cfg.Port == "" {
		t.Errorf("expected non-empty Port")
	}
	if cfg.JWTExpiryHrs <= 0 {
		t.Errorf("expected positive JWTExpiryHrs, got %d", cfg.JWTExpiryHrs)
	}
}

func TestConfigLoad_EnvironmentOverride(t *testing.T) {
	os.Setenv("APP_PORT", "9090")
	os.Setenv("JWT_EXPIRATION_HOURS", "48")
	defer func() {
		os.Unsetenv("APP_PORT")
		os.Unsetenv("JWT_EXPIRATION_HOURS")
	}()

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if cfg.Port != "9090" {
		t.Errorf("expected Port 9090, got %s", cfg.Port)
	}
	if cfg.JWTExpiryHrs != 48 {
		t.Errorf("expected JWTExpiryHrs 48, got %d", cfg.JWTExpiryHrs)
	}
}
