package auth

import (
	"net/http"
)

func Secure(next http.Handler) http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		tokenString := request.Header.Get("Authorization")
		if tokenString != "" {
			valid, err := ValidateToken(tokenString[7:]) //7 corresponds to "Bearer "
			if err != nil {
				http.Error(writer, err.Error(), http.StatusBadRequest)
			}
			if valid {
				next.ServeHTTP(writer, request)
				return
			}
		}
		writer.WriteHeader(http.StatusUnauthorized)
	})
}
