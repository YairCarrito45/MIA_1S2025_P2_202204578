package main

import (
	"fmt"
	"log"
	"strings"

	"backend/analyzer"
	"backend/stores"
	"backend/structures"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

// ---------- ESTRUCTURAS ----------
type CommandRequest struct {
	Command string `json:"command"`
}

type CommandResponse struct {
	Output string `json:"output"`
}

type LoginRequest struct {
	Username    string `json:"username"`
	Password    string `json:"password"`
	PartitionID string `json:"partition_id"`
}

// ---------- CONSTANTES ----------
const (
	errInvalidRequest  = "Error: Petición inválida"
	noCommandsMessage  = "No se ejecutó ningún comando"
)

// ---------- FUNCIÓN PRINCIPAL ----------
func main() {
	app := fiber.New()

	// Middleware CORS (permite conexión desde React)
	app.Use(cors.New())

	// Rutas disponibles
	app.Post("/execute", handleExecute)
	app.Post("/login", handleLogin)
	app.Get("/filesystem/:id", handleFilesystem) // ✅ NUEVO endpoint

	// Iniciar servidor
	log.Println("Servidor iniciado en http://localhost:3001")
	log.Fatal(app.Listen(":3001"))
}

// ---------- HANDLER: /execute ----------
func handleExecute(c *fiber.Ctx) error {
	var req CommandRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(CommandResponse{
			Output: errInvalidRequest,
		})
	}

	output := processCommands(req.Command)
	return c.JSON(CommandResponse{Output: output})
}

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

// ---------- HANDLER: /login ----------
func handleLogin(c *fiber.Ctx) error {
	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString("Error al leer datos de login")
	}

	partition, path, err := stores.GetMountedPartition(req.PartitionID)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).SendString("Partición no montada")
	}

	var sb structures.SuperBlock
	err = sb.Deserialize(path, int64(partition.Part_start))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Error al leer SuperBlock")
	}

	block, err := sb.GetUsersBlock(path)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Error al leer users.txt")
	}

	content := string(block.B_content[:])
	lines := strings.Split(content, "\n")

	for _, line := range lines {
		fields := strings.Split(line, ",")
		if len(fields) < 5 || fields[1] != "U" {
			continue
		}
		if fields[3] == req.Username && fields[4] == req.Password {
			uid := 0
			gid := 0
			fmt.Sscanf(fields[0], "%d", &uid)
			fmt.Sscanf(fields[2], "%d", &gid)
			stores.Auth.Login(req.Username, req.Password, req.PartitionID, uid, gid)
			return c.SendString("Login exitoso")
		}
	}

	return c.Status(fiber.StatusUnauthorized).SendString("Usuario o contraseña incorrectos")
}

// ---------- HANDLER: /filesystem/:id ----------
func handleFilesystem(c *fiber.Ctx) error {
	partitionID := c.Params("id")

	partition, path, err := stores.GetMountedPartition(partitionID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).SendString("Partición no montada")
	}

	var sb structures.SuperBlock
	if err := sb.Deserialize(path, int64(partition.Part_start)); err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Error al leer SuperBlock")
	}

	root, err := sb.ReadDirectoryTree(path)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Error al leer árbol de directorios")
	}

	return c.JSON(root)
}
