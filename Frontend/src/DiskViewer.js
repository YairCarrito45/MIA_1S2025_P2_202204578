import React from "react";
import { useLocation, useParams } from "react-router-dom";

function DiskViewer() {
  const { nombre } = useParams();
  const location = useLocation();
  const disk = location.state?.disk;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Explorador del Disco: {nombre}</h2>

      {disk ? (
        <div style={styles.infoBox}>
          <p><strong>Nombre:</strong> {disk.name}</p>
          <p><strong>Ruta:</strong> {disk.path}</p>
          <p><strong>Tamaño:</strong> {disk.size}</p>
          <p><strong>Fit:</strong> {disk.fit}</p>
          <p><strong>Particiones Montadas:</strong> {disk.mounted_partitions.join(", ")}</p>

          {/* Aquí iría el árbol del sistema de archivos (modo solo lectura) */}
          <div style={styles.treeBox}>
            <p><em>[Aquí se mostrará la estructura de carpetas e inodos]</em></p>
          </div>
        </div>
      ) : (
        <p style={{ color: "red" }}>No se encontró información del disco.</p>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "2rem",
    fontFamily: "Segoe UI, sans-serif",
  },
  title: {
    fontSize: "1.8rem",
    marginBottom: "1rem",
  },
  infoBox: {
    backgroundColor: "#f2f2f2",
    padding: "1rem",
    borderRadius: "8px",
  },
  treeBox: {
    marginTop: "2rem",
    padding: "1rem",
    backgroundColor: "#ffffff",
    border: "1px dashed #ccc",
    borderRadius: "6px",
  },
};

export default DiskViewer;
