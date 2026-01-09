package server

import (
	"net/http"

	"github.com/aidosgal/alemjobs/internal/entity"
	"github.com/aidosgal/alemjobs/pkg/jsonx"
)

func (s *server) Health(w http.ResponseWriter, r *http.Request) {
	resp, err := s.usecase.Health(r.Context(), &entity.HealthReq{})
	if err != nil {
		jsonx.WriteError(w, http.StatusInternalServerError, err)
	}

	jsonx.WriteJSON(w, http.StatusOK, resp)
}
