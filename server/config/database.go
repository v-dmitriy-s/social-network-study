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

var dbs []*sql.DB

func DataBase() *sql.DB {
	if dbs == nil || len(dbs) == 0 {
		log.Fatalf("Database wasn't connected")
	}
	db := dbs[0]
	dbs = append(dbs[1:], db)
	return db
}

func CloseDataBase() {
	if dbs != nil && len(dbs) > 0 {
		for _, db := range dbs {
			db.Close()
		}
	}
}

func ConnectDataBase(cfg *Config) {
	// Get configuration
	username := cfg.Database.Username
	password := cfg.Database.Password
	hosts := cfg.Database.Hosts
	database := cfg.Database.Name
	migrationDir := flag.String("migration.files", "./migrations",
		"Directory where the migration files are located?")
	flag.Parse()

	for _, host := range hosts {
		// Connecting database
		url := fmt.Sprintf("%s:%s@tcp(%s)/%s",username, password, host, database)
		log.Printf("DATABASE_URL %+v", url)
		var err error
		db, err := sql.Open("mysql", url)
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

		dbs = append(dbs, db)
	}
}
