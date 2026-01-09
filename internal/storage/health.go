package storage

import (
	"context"
	"fmt"
)

func (s *storage) Health(ctx context.Context) error {
	health, err := s.Client.Health.Create().
		SetStatus("health_check").
		Save(ctx)
	if err != nil {
		return fmt.Errorf("failed to create health check record: %w", err)
	}

	retrievedHealth, err := s.Client.Health.Get(ctx, health.ID)
	if err != nil {
		return fmt.Errorf("failed to read health check record: %w", err)
	}

	if retrievedHealth.Status != "health_check" {
		return fmt.Errorf("health check record status mismatch: expected 'health_check', got '%s'", retrievedHealth.Status)
	}

	err = s.Client.Health.DeleteOneID(health.ID).Exec(ctx)
	if err != nil {
		return fmt.Errorf("failed to delete health check record: %w", err)
	}

	return nil
}
