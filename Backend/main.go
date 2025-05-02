package main

import (
	"fmt"
	"log"
	"strings"
	"backend/analyzer"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

// Estructura del JSON que recibe el backend
type CommandRequest struct {
	Command string `json:"command"`
}

// Estructura del JSON que responde el backend
type CommandResponse struct {
	Output string `json:"output"`
}

const (
	errInvalidRequest = "Error: Petición inválida"
	noCommandsMessage = "No se ejecutó ningún comando"
)

func main() {
	app := fiber.New()

	// Middleware CORS para permitir peticiones desde cualquier origen
	app.Use(cors.New())

	// Ruta para ejecutar comandos
	app.Post("/execute", handleExecute)

	// Levanta el servidor en puerto 3001
	log.Println("Servidor iniciado en http://localhost:3001")
	log.Fatal(app.Listen(":3001"))
}

// handleExecute maneja la lógica del endpoint POST /execute
func handleExecute(c *fiber.Ctx) error {
	var req CommandRequest

	// Intenta parsear el JSON recibido
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(CommandResponse{
			Output: errInvalidRequest,
		})
	}

	// Ejecuta los comandos recibidos
	output := processCommands(req.Command)

	return c.JSON(CommandResponse{
		Output: output,
	})
}

// processCommands ejecuta cada línea de comando y acumula los resultados
func processCommands(rawInput string) string {
	lines := strings.Split(rawInput, "\n")
	var outputBuilder strings.Builder

	for _, line := range lines {
		cmd := strings.TrimSpace(line)
		if cmd == "" {
			continue
		}

		result, err := analyzer.Analyzer(cmd)
		if err != nil {
			outputBuilder.WriteString(fmt.Sprintf("Error: %s\n", err.Error()))
		} else {
			outputBuilder.WriteString(fmt.Sprintf("%s\n", result))
		}
	}

	if outputBuilder.Len() == 0 {
		return noCommandsMessage
	}
	return outputBuilder.String()
}
