package user

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
	"social-network-study/config"
	"strings"
)

/**
 * Service for working with Users
 */

type User struct {
	ID        int     `json:"id"`
	Login     string  `json:"login"`
	Password  string  `json:"password,omitempty"`
	FirstName string  `json:"firstName"`
	LastName  string  `json:"lastName"`
	BirthDay  string  `json:"birthDay"`
	Gender    *string `json:"gender"`
	Interests *string `json:"interests"`
	City      *string `json:"city"`
}

type Friend struct {
	ID        int     `json:"id"`
	FirstName string  `json:"firstName"`
	LastName  string  `json:"lastName"`
	City      *string `json:"city"`
	IsNew     bool    `json:"isNew"`
}

type Relationship struct {
	UserId int `json:"userId"`
	FriendId int `json:"friendId"`
}

type Credentials struct {
	Login    string `json:"login"`
	Password string `json:"password"`
}

/*	Get User by Id */
func FetchUserById(id int) (*User, error) {
	db := config.DataBase()
	rows, err := db.Query("SELECT id, login, firstName, lastName, birthDay, gender, interests, city FROM users WHERE id=?", id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	user := new(User)
	for rows.Next() {
		err = rows.Scan(
			&user.ID,
			&user.Login,
			&user.FirstName,
			&user.LastName,
			&user.BirthDay,
			&user.Gender,
			&user.Interests,
			&user.City,
		)
		if err != nil {
			return nil, err
		}
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	return user, nil
}

/* Get User by SingIn */
func FetchUserByLogin(login string) (*User, error) {
	db := config.DataBase()
	rows, err := db.Query("SELECT id, login, firstName, lastName, birthDay, gender, interests, city FROM users WHERE login=?", login)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	user := new(User)
	for rows.Next() {
		err = rows.Scan(
			&user.ID,
			&user.Login,
			&user.FirstName,
			&user.LastName,
			&user.BirthDay,
			&user.Gender,
			&user.Interests,
			&user.City,
		)
		if err != nil {
			return nil, err
		}
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	return user, nil
}

/* Check Login */
func FetchCheckLogin(login string) (bool, error) {
	db := config.DataBase()
	rows, err := db.Query("SELECT login FROM users WHERE login=?", login)
	if err != nil {
		return false, err
	}
	defer rows.Close()

	if err = rows.Err(); err != nil {
		return false, err
	}
	return rows.Next(), nil
}

/* Get New Friends by Search */
func FetchFriends(id int, search string) ([]*Friend, error) {
	db := config.DataBase()
	var str strings.Builder
	if search != "" {
		str.WriteString("AND (LOWER(u.firstName) LIKE '" + strings.ToLower(search) + "%' ")
		str.WriteString("OR LOWER(u.lastName) LIKE '" + strings.ToLower(search) + "%')")
	}
	rows, err := db.Query(fmt.Sprintf(`SELECT id, firstName, lastName, city 
								  FROM users u LEFT JOIN friends f ON u.id = f.user_id 
                                  WHERE f.friend_id=? %s`, str.String()), id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	friends := make([]*Friend, 0)
	for rows.Next() {
		friend := new(Friend)
		err = rows.Scan(&friend.ID, &friend.FirstName, &friend.LastName, &friend.City)
		if err != nil {
			return nil, err
		}
		friends = append(friends, friend)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	return friends, nil
}

/* Get all users by search string */
func FetchFullUsers(search string) ([]*Friend, error) {
	db := config.DataBase()
	var str strings.Builder
	if search != "" {
		str.WriteString("lower(firstName) LIKE '" + strings.ToLower(search) + "%' ")
		str.WriteString("AND lower(lastName) LIKE '" + strings.ToLower(search) + "%'")
	}
	rows, err := db.Query(fmt.Sprintf(`SELECT id, firstName, lastName 
								  FROM users WHERE %s ORDER BY id LIMIT 100`, str.String()))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	friends := make([]*Friend, 0)
	for rows.Next() {
		friend := new(Friend)
		err = rows.Scan(&friend.ID, &friend.FirstName, &friend.LastName)
		if err != nil {
			return nil, err
		}
		friend.IsNew = true
		friends = append(friends, friend)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	return friends, nil
}

/* Get unknown users by user id and search string */
func FetchUnknownUsers(id int, search string) ([]*Friend, error) {
	db := config.DataBase()
	var str strings.Builder
	if search != "" {
		str.WriteString("lower(firstName) LIKE '" + strings.ToLower(search) + "%' ")
		str.WriteString("OR lower(lastName) LIKE '" + strings.ToLower(search) + "%'")
	}
	rows, err := db.Query(fmt.Sprintf(`SELECT id, firstName, lastName, city 
								  FROM users WHERE %s AND id <> ? AND id not in 
                                  (SELECT u.id FROM users u INNER JOIN friends f on u.id = f.user_id 
	                              WHERE f.friend_id = ?) limit 100`, str.String()), id, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	friends := make([]*Friend, 0)
	for rows.Next() {
		friend := new(Friend)
		err = rows.Scan(&friend.ID, &friend.FirstName, &friend.LastName, &friend.City)
		if err != nil {
			return nil, err
		}
		friend.IsNew = true
		friends = append(friends, friend)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	return friends, nil
}

/* Register new User */
func Register(user *User) (*User, error) {
	db := config.DataBase()
	tx, err := db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	stmt, err := db.Prepare("INSERT INTO users(login, password, firstName, lastName, birthDay) VALUES (?,?,?,?,?)")
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	password := string(hashedPassword)

	exec, err := stmt.Exec(user.Login, password, user.FirstName, user.LastName, user.BirthDay)
	if err != nil {
		return nil, err
	}
	err = tx.Commit()
	if err != nil {
		return nil, err
	}

	id, err := exec.LastInsertId()
	if err != nil {
		return nil, err
	}
	user.ID = int(id)
	user.Password = ""

	return user, nil
}

/* Update base information about User */
func Update(user *User) (bool, error) {
	db := config.DataBase()
	tx, err := db.Begin()
	if err != nil {
		return false, err
	}
	defer tx.Rollback()

	stmt, err := db.Prepare("UPDATE users SET login=?, firstName=?, lastName=?, birthDay=?, gender=?, interests=?, city=? WHERE id=?")
	if err != nil {
		return false, err
	}
	defer stmt.Close()

	_, err = stmt.Exec(
		&user.Login,
		&user.FirstName,
		&user.LastName,
		&user.BirthDay,
		&user.Gender,
		&user.Interests,
		&user.City,
		&user.ID,
	)
	if err != nil {
		return false, err
	}
	err = tx.Commit()
	if err != nil {
		return false, err
	}
	return true, nil
}

/* Add friend for User */
func AddFriend(relationship *Relationship) (bool, error) {
	db := config.DataBase()
	tx, err := db.Begin()
	if err != nil {
		return false, err
	}
	defer tx.Rollback()

	stmt, err := db.Prepare("INSERT INTO friends(user_id, friend_id) VALUES (?, ?)")
	if err != nil {
		return false, err
	}
	defer stmt.Close()

	_, err = stmt.Exec(
		relationship.UserId,
		relationship.FriendId,
	)
	if err != nil {
		return false, err
	}
	_, err = stmt.Exec(
		relationship.FriendId,
		relationship.UserId,
	)
	if err != nil {
		return false, err
	}

	err = tx.Commit()
	if err != nil {
		return false, err
	}
	return true, nil
}

/* Remove friend for User */
func RemoveFriend(relationship *Relationship) (bool, error) {
	db := config.DataBase()
	tx, err := db.Begin()
	if err != nil {
		return false, err
	}
	defer tx.Rollback()

	stmt, err := db.Prepare("DELETE FROM friends WHERE user_id=? AND friend_id=?")
	if err != nil {
		return false, err
	}
	defer stmt.Close()
	_, err = stmt.Exec(
		relationship.UserId,
		relationship.FriendId,
	)
	if err != nil {
		return false, err
	}
	_, err = stmt.Exec(
		relationship.FriendId,
		relationship.UserId,
	)
	if err != nil {
		return false, err
	}
	err = tx.Commit()
	if err != nil {
		return false, err
	}
	return true, nil
}

/* Delete User by Id */
func DeleteById(id int) (bool, error) {
	db := config.DataBase()
	tx, err := db.Begin()
	if err != nil {
		return false, err
	}
	defer tx.Rollback()

	stmt, err := db.Prepare("DELETE FROM users WHERE id=?")
	if err != nil {
		return false, err
	}
	defer stmt.Close()

	_, err = stmt.Exec(id)
	if err != nil {
		return false, err
	}
	err = tx.Commit()
	if err != nil {
		return false, err
	}
	return true, nil
}

/* Check Password */
func CheckPassword(credentials *Credentials) (*User, error) {
	db := config.DataBase()
	rows, err := db.Query("SELECT * FROM users WHERE login=?", credentials.Login)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	user := new(User)
	for rows.Next() {
		err = rows.Scan(
			&user.ID,
			&user.Login,
			&user.Password,
			&user.FirstName,
			&user.LastName,
			&user.BirthDay,
			&user.Gender,
			&user.Interests,
			&user.City,
		)
		if err != nil {
			return nil, err
		}
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}

	if err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(credentials.Password)); err != nil {
		return nil, err
	}

	user.Password = ""
	return user, nil
}
