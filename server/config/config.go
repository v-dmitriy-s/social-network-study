package config

import (
	"fmt"
	"gopkg.in/yaml.v2"
	"log"
	"os"
)

type Config struct {
	Server struct {
		Port string `yaml:"port"`
	} `yaml:"server"`
	Database struct {
		Username string `yaml:"user"`
		Password string `yaml:"pass"`
		Hosts     []string `yaml:"hosts"`
		Name     string `yaml:"name"`
	} `yaml:"database"`
}

/**
Init configuration
*/
func InitConfig() *Config {
	cfg := new(Config)
	readConfigFile(cfg)
	return cfg
}

/**
Read configuration file for
application settings
*/
func readConfigFile(cfg *Config) {
	profile := os.Getenv("APP_PROFILE")
	log.Printf("APP_PROFILE %+v", profile)
	configFile := "config.yaml"
	if profile != "" && profile != "default" {
		configFile = fmt.Sprintf("config-%s.yaml", profile)
	}
	f, err := os.Open(configFile)
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
Will throw error if cannot
read configuration file
*/
func processError(err error) {
	fmt.Println(err)
	os.Exit(2)
}
