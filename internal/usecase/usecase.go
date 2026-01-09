package usecase

import (
	"context"

	"github.com/aidosgal/alemjobs/config"
	"github.com/aidosgal/alemjobs/internal/entity"
	"github.com/aidosgal/alemjobs/internal/storage"
)

type Usecase interface {
	Health(ctx context.Context, req *entity.HealthReq) (*entity.HealthResp, error)
}

type usecase struct {
	cfg     *config.Config
	storage storage.Storage
}

func New(cfg *config.Config, storage storage.Storage) Usecase {
	return &usecase{
		cfg:     cfg,
		storage: storage,
	}
}
