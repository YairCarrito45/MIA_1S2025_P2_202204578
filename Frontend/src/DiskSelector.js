// src/DiskSelector.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function DiskSelector() {
  const [disks, setDisks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3001/disks")
      .then((res) => res.json())
      .then((data) => setDisks(data))
      .catch((err) => console.error("Error al cargar discos:", err));
  }, []);

  const handleSelect = (disk) => {
    navigate(`/viewer/${disk.name}`, { state: { disk } });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Visualizador del Sistema de Archivos</h2>
      <p style={styles.subtitle}>Seleccione el disco que desea visualizar:</p>
      <div style={styles.grid}>
        {disks.map((disk) => (
          <div
            key={disk.name}
            style={styles.card}
            onClick={() => handleSelect(disk)}
          >
            <img
              src="/disk-icon.png"
              alt="Disco"
              style={{ width: "64px", marginBottom: "1rem" }}
            />
            <h3>{disk.name}</h3>
            <p>Capacidad: {disk.size}</p>
            <p>Fit: {disk.fit}</p>
            <p>Particiones: {disk.mounted_partitions.join(", ") || "Ninguna"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    padding: "2rem",
    fontFamily: "Segoe UI, sans-serif",
  },
  title: {
    fontSize: "1.6rem",
    marginBottom: "0.5rem",
  },
  subtitle: {
    marginBottom: "1.5rem",
    color: "#555",
  },
  grid: {
    display: "flex",
    justifyContent: "center",
    gap: "1.5rem",
    flexWrap: "wrap",
  },
  card: {
    backgroundColor: "#eafafa",
    borderRadius: "10px",
    padding: "1.2rem",
    cursor: "pointer",
    width: "200px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    transition: "transform 0.2s",
  },
};

export default DiskSelector;
