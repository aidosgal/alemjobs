package server

import "github.com/gorilla/mux"

func (s *server) RegisterRoutes(r *mux.Router) {
	// Health check endpoint
	r.HandleFunc("/api/v1/health", s.Health).Methods("GET")

	// Add more routes here as your application grows
}
