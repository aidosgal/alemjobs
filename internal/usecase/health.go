package usecase

import (
	"context"

	"github.com/aidosgal/alemjobs/internal/consts"
	"github.com/aidosgal/alemjobs/internal/entity"
)

func (u *usecase) Health(ctx context.Context, req *entity.HealthReq) (*entity.HealthResp, error) {
	if err := u.storage.Health(ctx); err != nil {
		return nil, err
	}

	return &entity.HealthResp{
		Status: consts.HealthStatusOK,
	}, nil
}
