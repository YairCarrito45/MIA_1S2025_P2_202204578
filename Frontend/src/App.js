// Importación de React y hooks necesarios
import React, { useState, useEffect, useRef } from "react";

// Monaco Editor: componente para crear el editor de texto estilo VSCode
import Editor from "@monaco-editor/react";

// Estilos de la app
import "./App.css";

function App() {
  // Estado para almacenar los comandos ingresados en el editor
  const [commandInput, setCommandInput] = useState("");

  // Estado para mostrar la salida de la ejecución
  const [output, setOutput] = useState("");

  // Referencia al textarea para auto-resize
  const textareaRef = useRef(null);

  // Auto-resize del textarea de salida cada vez que cambia el output
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [output]);

  // ----------------------------------------------
  // FUNCIÓN: Cargar archivo .smia desde el sistema
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

  // -----------------------------------------------------
  // FUNCIÓN: Ejecutar comandos enviándolos al backend
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

  // ----------------------------------------
  // FUNCIÓN: Limpiar la entrada y la salida
  const handleClear = () => {
    setCommandInput("");
    setOutput("");
  };

  // ---------------------
  // RENDERIZADO PRINCIPAL
  return (
    <div className="App">
      {/* Encabezado del proyecto */}
      <header className="App-header">
        <h1>Sistema de Archivos EXT2 - Proyecto MIA</h1>
      </header>

      {/* Botones de control */}
      <div className="controls">
        <input type="file" accept=".smia" onChange={handleFileUpload} />
        <button onClick={handleExecute}>Ejecutar</button>
        <button onClick={handleClear}>Limpiar</button>
      </div>

      {/* Área dividida: Entrada y Salida */}
      <div className="editor-container">
        {/* Entrada de comandos con editor */}
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

        {/* Salida de los comandos ejecutados */}
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
    </div>
  );
}

export default App;
