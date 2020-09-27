package user

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
	"social-network-study/model/auth"
	"strconv"
)

/* Authentication */
func SingIn(writer http.ResponseWriter, request *http.Request) {
	credentials := new(Credentials)
	err := json.NewDecoder(request.Body).Decode(credentials)
	if err != nil {
		http.Error(writer, err.Error(), http.StatusBadRequest)
		return
	}
	userByLogin, err := CheckPassword(credentials)
	if err != nil {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}

	token, err := auth.CreateToken(userByLogin.Login)
	if err != nil {
		http.Error(writer, err.Error(), http.StatusInternalServerError)
		return
	}

	writer.Header().Add("Content-Type", "application/json")
	writer.Header().Add("Authorization", fmt.Sprintf("Bearer %s", token))
}

/* Register new User */
func SingUp(writer http.ResponseWriter, request *http.Request) {
	userNew := new(User)
	err := json.NewDecoder(request.Body).Decode(userNew)
	if err != nil {
		http.Error(writer, err.Error(), http.StatusBadRequest)
		return
	}
	userSaved, err := Register(userNew)
	if err != nil {
		http.Error(writer, err.Error(), http.StatusInternalServerError)
		return
	}

	token, err := auth.CreateToken(userSaved.Login)
	if err != nil {
		http.Error(writer, err.Error(), http.StatusInternalServerError)
		return
	}

	writer.Header().Add("Content-Type", "application/json")
	writer.Header().Add("Authorization", fmt.Sprintf("Bearer %s", token))
}

/* Get current user */
func GetCurrentUser(writer http.ResponseWriter, request *http.Request) {
	currentUser, err := GetCurrentPrincipal(request)
	if err != nil {
		http.Error(writer, err.Error(), http.StatusInternalServerError)
		return
	}

	writer.Header().Add("Content-Type", "application/json")
	err = json.NewEncoder(writer).Encode(currentUser)
	if err != nil {
		http.Error(writer, err.Error(), http.StatusInternalServerError)
		return
	}
}

/* Get user by id */
func GetUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])
	user, err := FetchUserById(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Add("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

/* Get friends by id and search string */
func GetFriends(w http.ResponseWriter, r *http.Request) {
	queryParams := r.URL.Query()
	id, _ := strconv.Atoi(queryParams["id"][0])
	querySearch, ok := queryParams["search"]
	var search = ""
	if ok || len(querySearch) > 0 {
		search = querySearch[0]
	}
	friends, err := FetchFriends(id, search)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Add("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(friends)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

/* Get all users by search string */
func GetFullUsers(w http.ResponseWriter, r *http.Request) {
	queryParams := r.URL.Query()
	querySearch, ok := queryParams["search"]
	var search = ""
	if ok || len(querySearch) > 0 {
		search = querySearch[0]
	}
	friends, err := FetchFullUsers(search)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Add("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(friends)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

/* Get unknown users by user id and search string */
func GetUnknownUsers(w http.ResponseWriter, r *http.Request) {
	queryParams := r.URL.Query()
	id, _ := strconv.Atoi(queryParams["id"][0])
	querySearch, ok := queryParams["search"]
	var search = ""
	if ok || len(querySearch) > 0 {
		search = querySearch[0]
	}
	friends, err := FetchUnknownUsers(id, search)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Add("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(friends)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func GetCheckLogin(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	login := vars["login"]
	checked, err := FetchCheckLogin(login)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Add("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(checked)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func DeleteUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	err := CheckForbidden(id, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}

	friends, err := DeleteById(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Add("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(friends)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func UpdateUser(w http.ResponseWriter, r *http.Request) {
	updatedUser := new(User)
	err := json.NewDecoder(r.Body).Decode(updatedUser)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = CheckForbidden(updatedUser.ID, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}

	_, err = Update(updatedUser)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Add("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(updatedUser)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func PostAddFriend(w http.ResponseWriter, r *http.Request) {
	newFriend := new(Relationship)
	err := json.NewDecoder(r.Body).Decode(newFriend)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = CheckForbidden(newFriend.UserId, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}

	_, err = AddFriend(newFriend)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Add("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(newFriend)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func DeleteFriend(w http.ResponseWriter, r *http.Request) {
	relationship := new(Relationship)
	err := json.NewDecoder(r.Body).Decode(relationship)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = CheckForbidden(relationship.UserId, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}

	_, err = RemoveFriend(relationship)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Add("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(relationship)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func GetCurrentPrincipal(request *http.Request) (*User, error) {
	tokenString := request.Header.Get("Authorization")
	login, err := auth.GetLoginByToken(tokenString[7:]) //7 corresponds to "Bearer "
	if err != nil {
		return nil, err
	}
	userByLogin, err := FetchUserByLogin(login)
	if err != nil {
		return nil, err
	}
	return userByLogin, nil
}

func CheckForbidden(id int, request *http.Request) error {
	currentUser, err := GetCurrentPrincipal(request)
	if err != nil {
		return err
	}
	if currentUser.ID != id {
		return errors.New("forbidden request")
	}
	return nil
}