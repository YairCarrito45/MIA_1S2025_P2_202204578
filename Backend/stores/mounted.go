package stores

import (
	structures "backend/structures"
	"errors"
	"sort"
	"strings"
)

// Carnet de estudiante
const Carnet string = "78"

// Información completa de una partición montada
type MountInfo struct {
	Path        string // Ruta del disco
	Name        string // Nombre de la partición
	Letter      string // Letra asignada al disco (A, B, C...)
	Correlative int    // Número de partición montada (1, 2, 3...)
}

// Declaración de variables globales
var (
	MountedPartitions map[string]MountInfo = make(map[string]MountInfo)
)

// GetMountedPartition obtiene la partición montada con el id especificado
func GetMountedPartition(id string) (*structures.Partition, string, error) {
	info, ok := MountedPartitions[id]
	if !ok {
		return nil, "", errors.New("la partición no está montada")
	}
	path := info.Path

	var mbr structures.MBR
	err := mbr.Deserialize(path)
	if err != nil {
		return nil, "", err
	}

	partition, _ := mbr.GetPartitionByName(info.Name)
	if partition == nil {
		return nil, "", errors.New("partición no encontrada")
	}

	return partition, path, nil
}


// GetMountedPartitionRep obtiene el MBR y SuperBlock de la partición montada
func GetMountedPartitionRep(id string) (*structures.MBR, *structures.SuperBlock, string, error) {
	info, exists := MountedPartitions[id]
	if !exists {
		return nil, nil, "", errors.New("la partición no está montada")
	}

	path := info.Path

	// Leer el MBR
	mbr, err := structures.ReadMBR(path)
	if err != nil {
		return nil, nil, "", err
	}

	// Buscar partición primaria o extendida
	partition, _ := mbr.GetPartitionByName(info.Name)
	if partition != nil {
		var sb structures.SuperBlock
		err := sb.Deserialize(path, int64(partition.Part_start))
		if err != nil {
			return nil, nil, "", err
		}
		return &mbr, &sb, path, nil
	}

	// Si no es primaria, buscar como partición lógica
	ebr, err := mbr.GetLogicalPartitionByName(info.Name, path)
	if err != nil {
		return nil, nil, "", errors.New("partición no encontrada")
	}

	var sb structures.SuperBlock
	err = sb.Deserialize(path, int64(ebr.PartStart))
	if err != nil {
		return nil, nil, "", err
	}

	return &mbr, &sb, path, nil
}



// GetMountedPartitionSuperblock obtiene el SuperBlock y partición montada con el id
func GetMountedPartitionSuperblock(id string) (*structures.SuperBlock, *structures.Partition, string, error) {
	info, ok := MountedPartitions[id]
	if !ok {
		return nil, nil, "", errors.New("la partición no está montada")
	}
	path := info.Path

	var mbr structures.MBR
	err := mbr.Deserialize(path)
	if err != nil {
		return nil, nil, "", err
	}

	// Buscar partición primaria
	partition, _ := mbr.GetPartitionByName(info.Name)
	if partition != nil {
		var sb structures.SuperBlock
		err := sb.Deserialize(path, int64(partition.Part_start))
		if err != nil {
			return nil, nil, "", err
		}
		return &sb, partition, path, nil
	}

	// Si no está como primaria, buscar lógica
	ebr, err := mbr.GetLogicalPartitionByName(info.Name, path)
	if err != nil {
		return nil, nil, "", errors.New("partición no encontrada")
	}

	var sb structures.SuperBlock
	err = sb.Deserialize(path, int64(ebr.PartStart))
	if err != nil {
		return nil, nil, "", err
	}

	// Retornamos nil como partición porque es lógica, o puedes ajustar la firma si necesitas manejar EBRs aparte
	return &sb, nil, path, nil
}


// ShowMountedPartitions imprime los IDs de todas las particiones montadas
func ShowMountedPartitions() string {
	if len(MountedPartitions) == 0 {
		return "No hay particiones montadas."
	}

	grouped := make(map[string][]string)
	for id := range MountedPartitions {
		prefix := id[:len(id)-1]
		grouped[prefix] = append(grouped[prefix], id)
	}

	var prefixes []string
	for prefix := range grouped {
		prefixes = append(prefixes, prefix)
	}
	sort.Strings(prefixes)

	var result strings.Builder
	result.WriteString("======================== MOUNTED =========================\n")
	result.WriteString("Particiones montadas:\n")

	for _, prefix := range prefixes {
		ids := grouped[prefix]
		sort.Strings(ids)
		result.WriteString("  Disco " + prefix + ": " + strings.Join(ids, ", ") + "\n")
	}
	result.WriteString("============================================================\n")
	return result.String()
}
