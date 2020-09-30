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
Will throw error if cannot
read configuration file
*/
func processError(err error) {
	fmt.Println(err)
	os.Exit(2)
}
