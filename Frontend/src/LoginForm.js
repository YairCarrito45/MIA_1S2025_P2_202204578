// LoginForm.js
import React, { useState } from "react";

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validación básica: no campos vacíos
    if (username.trim() === "" || password.trim() === "") {
      alert("Por favor, completa ambos campos.");
      return;
    }

    // Simulación de login exitoso (puedes conectar con backend más adelante)
    onLogin(username);
  };

  return (
    <div style={{ color: "#d8dee9", textAlign: "center" }}>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            marginBottom: "1rem",
            padding: "0.5rem",
            width: "100%",
            borderRadius: "6px",
            fontSize: "1rem",
          }}
        />
        <br />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            marginBottom: "1rem",
            padding: "0.5rem",
            width: "100%",
            borderRadius: "6px",
            fontSize: "1rem",
          }}
        />
        <br />
        <button
          type="submit"
          style={{
            padding: "0.6rem 1.5rem",
            backgroundColor: "#2e7d32",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Ingresar
        </button>
      </form>
    </div>
  );
}

export default LoginForm;
