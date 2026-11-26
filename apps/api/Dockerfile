# Stage 1: Build Go binary
FROM golang:alpine AS builder

WORKDIR /app

ENV GOTOOLCHAIN=auto

RUN apk add --no-cache ca-certificates tzdata git

# Cache Go modules
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build optimized binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/bin/server ./cmd/server

# Stage 2: Minimal runtime environment
FROM alpine:3.20

WORKDIR /app

RUN apk --no-cache add ca-certificates tzdata

# Copy compiled binary and API documentation
COPY --from=builder /app/bin/server /app/server
COPY --from=builder /app/docs/openapi.json /app/docs/openapi.json

# Default port
EXPOSE 8080

# Run API server
CMD ["/app/server"]
