package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/aidosgal/alemjobs/config"
	"github.com/aidosgal/alemjobs/internal/server"
	"github.com/aidosgal/alemjobs/internal/storage"
	"github.com/aidosgal/alemjobs/internal/storage/postgres/ent"
	"github.com/aidosgal/alemjobs/internal/usecase"
	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

func main() {
	cfg := config.NewConfig()

	r := mux.NewRouter()

	entPsqlConnect := fmt.Sprintf("host=%s port=%d user=%s dbname=%s password=%s sslmode=%s",
		cfg.Database.Host,
		cfg.Database.Port,
		cfg.Database.User,
		cfg.Database.Name,
		cfg.Database.Password,
		"disable",
	)

	client, err := ent.Open("postgres", entPsqlConnect)
	if err != nil {
		log.Fatal(err)
	}
	defer client.Close()

	if err := client.Schema.Create(context.Background()); err != nil {
		log.Fatal(err)
	}

	strg := storage.New(client)

	usc := usecase.New(cfg, strg)

	srv := server.New(cfg, usc)

	srv.RegisterRoutes(r)

	//TODO: Make graceful shutdown
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", cfg.Port), r))
}
