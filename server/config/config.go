package config

import (
	"fmt"
	"gopkg.in/yaml.v2"
	"os"
)

type Config struct {
	Server struct {
		Port string `yaml:"port"`
	} `yaml:"server"`
	Database struct {
		Username string `yaml:"user"`
		Password string `yaml:"pass"`
		Host     string `yaml:"host"`
		Port     string `yaml:"port"`
		Name     string `yaml:"name"`
	} `yaml:"database"`
}

/**
Init configuration
*/
func InitConfig() *Config {
	cfg := new(Config)
	readConfigFile(cfg)
	readEnv(cfg)
	return cfg
}

/**
Read configuration file for
application settings
*/
func readConfigFile(cfg *Config) {
	f, err := os.Open("config.yaml")
	if err != nil {
		processError(err)
	}
	defer f.Close()

	decoder := yaml.NewDecoder(f)
	err = decoder.Decode(&cfg)
	if err != nil {
		processError(err)
	}
}

/**
Read configuration enviroments
*/
func readEnv(cfg *Config) {
	port := os.Getenv("PORT")
	dbUsername := os.Getenv("DB_USERNAME")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")

	if port != "" {
		cfg.Server.Port = port
	}
	if dbUsername != "" {
		cfg.Database.Username = dbUsername
	}
	if dbPassword != "" {
		cfg.Database.Password = dbPassword
	}
	if dbHost != "" {
		cfg.Database.Host = dbHost
	}
	if dbPort != "" {
		cfg.Database.Port = dbPort
	}
	if dbName != "" {
		cfg.Database.Name = dbName
	}
}

/**
Will throw error if cannot
read configuration file
*/
func processError(err error) {
	fmt.Println(err)
	os.Exit(2)
}
