package config

import (
	"database/sql"
	"flag"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/mysql"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"log"
	"time"
)

var db *sql.DB

func DataBase() *sql.DB {
	if db == nil {
		log.Fatalf("Database wasn't connected")
	}
	return db
}

func ConnectDataBase(cfg *Config) *sql.DB {
	if db != nil {
		return db
	}
	// Get configuration
	//username := cfg.Database.Username
	//password := cfg.Database.Password
	//host := cfg.Database.Host
	//port := cfg.Database.Port
	database := cfg.Database.Name
	migrationDir := flag.String("migration.files", "./migrations",
		"Directory where the migration files are located?")
	flag.Parse()

	// Connecting database

	url := "b62100544d0a33:5b60fb2c@tcp(us-cdbr-east-02.cleardb.com:3306)/heroku_ec5f4e7cf2ab603"//os.Getenv("DATABASE_URL")
	//if url == "" {
	//	url = fmt.Sprintf("%s:%s@tcp(%s:%s)/%s",username, password, host, port, database)
	//}

	log.Printf("DATABASE_URL %+v", url)
	var err error
	db, err = sql.Open("mysql", url)
	if err != nil {
		log.Fatalf("Cannot connect to the database... %v", err)
	}
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)
	if err := db.Ping(); err != nil {
		log.Fatalf("Cannot ping to the database... %v", err)
	}

	// Run migration
	driver, err := mysql.WithInstance(db, &mysql.Config{})
	if err != nil {
		log.Fatalf("Cannot start sql migration... %v", err)
	}

	m, err := migrate.NewWithDatabaseInstance(
		fmt.Sprintf("file://%s", *migrationDir),
		database,
		driver,
	)
	if err != nil {
		log.Fatalf("Migration failed... %v", err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		log.Fatalf("An error occurred while syncing the database.. %v", err)
	}
	log.Println("Database migrated")
	return db
}
