# Build the Go API
FROM golang:1.14-alpine AS go_builder
LABEL stage=intermediate
ADD . /app
WORKDIR /app/server
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags "-w" -a -o /main .
# Build the React application
FROM node:14.4-alpine AS node_builder
LABEL stage=intermediate
COPY --from=go_builder /app/client ./
RUN yarn
RUN GENERATE_SOURCEMAP=false yarn build
# Final stage build, this will be the container
# that we will deploy to production
FROM alpine:latest
ENV PORT 53372
RUN apk --no-cache add ca-certificates
COPY --from=go_builder /main ./
COPY --from=go_builder /app/server/config.yaml ./
COPY --from=go_builder /app/server/migrations ./migrations
COPY --from=node_builder /build ./html
RUN chmod +x ./main
EXPOSE $PORT
CMD ./main