package server

import (
	"net/http"

	"github.com/aidosgal/alemjobs/config"
	"github.com/aidosgal/alemjobs/internal/usecase"
	"github.com/gorilla/mux"
)

type Server interface {
	Health(w http.ResponseWriter, r *http.Request)
	RegisterRoutes(r *mux.Router)
}

type server struct {
	cfg     *config.Config
	usecase usecase.Usecase
}

func New(cfg *config.Config, usecase usecase.Usecase) Server {
	return &server{
		cfg:     cfg,
		usecase: usecase,
	}
}
