package auth

import (
	"errors"
	"fmt"
	"github.com/dgrijalva/jwt-go"
)

/**
 * Service for working with Registration and Authentication
 */

var jwtSecret = []byte("D6E6BEAABF9BD6992886D3F176C8A62A56F91FA63A6FB5BA257E5F051975391F")

/* Validate Token */
func ValidateToken(tokenString string) (bool, error) {
	if tokenString == "" {
		return false, errors.New("authorization token must be present")
	}

	token, _ := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("there was an error")
		}
		return jwtSecret, nil
	})

	if _, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return true, nil
	} else {
		return false, errors.New("invalid authorization token")
	}
}

/* Generate token by SingIn and Password */
func CreateToken(login string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"login":    login,
	})
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

/* Get string login by token */
func GetLoginByToken(tokenString string) (string, error) {
	if tokenString == "" {
		return "", errors.New("authorization token must be present")
	}
	claims := jwt.MapClaims{}
	_, _ = jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("there was an error")
		}
		return jwtSecret, nil
	})

	login := claims["login"].(string)
	return login, nil
}
