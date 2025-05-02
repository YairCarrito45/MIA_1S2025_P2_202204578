import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import "./App.css";
import LoginForm from "./LoginForm"; // Asegúrate de que esté en el mismo directorio

function App() {
  const [commandInput, setCommandInput] = useState("");
  const [output, setOutput] = useState("");
  const textareaRef = useRef(null);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [mostrarLogin, setMostrarLogin] = useState(false);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [output]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".smia")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCommandInput(event.target.result);
      };
      reader.readAsText(file);
    } else {
      alert("Por favor selecciona un archivo .smia válido");
    }
  };

  const handleExecute = async () => {
    try {
      const response = await fetch("http://localhost:3001/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ command: commandInput }),
      });

      const result = await response.json();
      setOutput(result.output);
    } catch (error) {
      setOutput("Error al comunicarse con el backend.");
    }
  };

  const handleClear = () => {
    setCommandInput("");
    setOutput("");
  };

  const handleLogout = () => {
    setUsuarioActual(null);
    setCommandInput("");
    setOutput("");
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Sistema de Archivos EXT2/EXT3 - Proyecto MIA</h1>
        {usuarioActual && (
          <p>Sesión activa: <strong>{usuarioActual}</strong></p>
        )}
      </header>

      <div className="controls">
        <input type="file" accept=".smia" onChange={handleFileUpload} />
        <button onClick={handleExecute} disabled={!usuarioActual}>Ejecutar</button>
        <button onClick={handleClear}>Limpiar</button>

        {!usuarioActual ? (
          <button
            onClick={() => setMostrarLogin(true)}
            style={{ backgroundColor: "#2e7d32", color: "white" }}
          >
            Iniciar Sesión
          </button>
        ) : (
          <button
            onClick={handleLogout}
            style={{ backgroundColor: "#880e4f", color: "white" }}
          >
            Cerrar Sesión ({usuarioActual})
          </button>
        )}
      </div>

      <div className="editor-container">
        <div className="editor">
          <label>Entrada:</label>
          <Editor
            height="560px"
            language="plaintext"
            theme="hc-black"
            value={commandInput}
            onChange={(value) => setCommandInput(value)}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              wordWrap: "on",
            }}
          />
        </div>

        <div className="editor">
          <label>Salida:</label>
          <textarea
            ref={textareaRef}
            className="salida"
            value={output}
            readOnly
            placeholder="#------Estiben Yair Lopez Leveron------ 202204578----"
          />
        </div>
      </div>

      {/* Ventana flotante de Login */}
      {mostrarLogin && (
        <div style={{
          position: "fixed",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "#1e1e1e",
          padding: "2rem",
          borderRadius: "10px",
          boxShadow: "0 0 15px rgba(0,0,0,0.5)",
          zIndex: 1000
        }}>
          <LoginForm
            onLogin={(user) => {
              setUsuarioActual(user);
              setMostrarLogin(false);
            }}
          />
          <button onClick={() => setMostrarLogin(false)} style={{ marginTop: "1rem" }}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
