package config

import (
	"fmt"
	"github.com/kelseyhightower/envconfig"
	"gopkg.in/yaml.v2"
	"os"
)

type Config struct {
	Server struct {
		Host string `yaml:"host",envconfig:"SERVER_HOST"`
		Port string `yaml:"port",envconfig:"SERVER_PORT"`
	} `yaml:"server"`
	Database struct {
		Username string `yaml:"user",envconfig:"DB_USERNAME"`
		Password string `yaml:"pass",envconfig:"DB_PASSWORD"`
		Host string `yaml:"host",envconfig:"DB_HOST"`
		Port string `yaml:"port",envconfig:"DB_PORT"`
		Name string `yaml:"name",envconfig:"DB_NAME"`
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
	err = decoder.Decode(cfg)
	if err != nil {
		processError(err)
	}
}

/**
Read configuration enviroments
*/
func readEnv(cfg *Config) {
	err := envconfig.Process("", cfg)
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
