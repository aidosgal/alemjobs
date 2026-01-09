package storage

import (
	"context"

	"github.com/aidosgal/alemjobs/internal/storage/postgres/ent"
)

type Storage interface {
	Health(ctx context.Context) error
}

type storage struct {
	*ent.Client
}

func New(client *ent.Client) Storage {
	return &storage{
		client,
	}
}
