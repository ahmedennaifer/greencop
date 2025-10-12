package internal

import (
	"log/slog"
	"os"
)

func Logger() *slog.Logger {
	jsonHandler := slog.NewJSONHandler(os.Stderr, nil)
	logger := slog.New(jsonHandler)
	return logger
}
