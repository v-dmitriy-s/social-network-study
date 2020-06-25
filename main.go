package main

import (
	"fmt"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"log"
	"net/http"
	"network-test/config"
	"network-test/model/auth"
	"network-test/model/user"
)

func main() {
	cfg := config.InitConfig()
	log.Printf("%+v", cfg)
	dataBase := config.ConnectDataBase(cfg)
	defer dataBase.Close()

	router := mux.NewRouter()
	allowHeaders := []string{"Accept", "Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization", "If-Modified-Since"}
	headers := handlers.AllowedHeaders(allowHeaders)
	methods := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"})
	origins := handlers.AllowedOrigins([]string{"*"})
	credentials := handlers.AllowCredentials()
	exposedHeaders := handlers.ExposedHeaders(allowHeaders)

	router.HandleFunc("/singin", user.SingIn).Methods("POST")
	router.HandleFunc("/singup", user.SingUp).Methods("POST")
	router.HandleFunc("/singup/{login}", user.GetCheckLogin).Methods("GET")

	api := router.PathPrefix("/api/v1").Subrouter()
	api.Use(auth.Secure)
	api.HandleFunc("/current-user", user.GetCurrentUser).Methods("GET")
	api.HandleFunc("/users/{id}", user.GetUser).Methods("GET")
	api.HandleFunc("/users/{id}", user.DeleteUser).Methods("DELETE")
	api.HandleFunc("/users", user.UpdateUser).Methods("PUT")
	api.HandleFunc("/friends/unknown", user.GetUnknownUsers).Methods("GET")
	api.HandleFunc("/friends", user.GetFriends).Methods("GET")
	api.HandleFunc("/friends", user.PostAddFriend).Methods("POST")
	api.HandleFunc("/friends", user.DeleteFriend).Methods("DELETE")

	port := cfg.Server.Port
	log.Printf("Server was started on port: %s", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), handlers.CORS(headers, methods, origins, credentials, exposedHeaders)(router)))
}