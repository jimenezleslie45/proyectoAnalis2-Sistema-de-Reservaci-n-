import React, { useState } from "react";

export default function AISugerencia() {
  const [pregunta, setPregunta] = useState("");
  const [respuesta, setRespuesta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // URL del backend FastAPI (tu endpoint de IA)
  const API_URL = "http://localhost:8000/chat-ia";

  const enviarPregunta = async (e) => {
    e.preventDefault();
    if (!pregunta.trim()) return;
    setLoading(true);
    setError(null);
    setRespuesta(null);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: pregunta }),
      });

      if (!res.ok) throw new Error(`Error del servidor (${res.status})`);
      const data = await res.json();

      // ✅ Ajuste: el backend responde con { respuesta: "..." }
      setRespuesta(data.respuesta || "No se obtuvo respuesta.");
    } catch (err) {
      setError("⚠️ Error al comunicarse con la IA: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel-card">
      <header className="page-header">
        <h1>🤖 Asistente Inteligente</h1>
        <p className="muted">
          Consulta al asistente para obtener recomendaciones sobre reservas.
        </p>
      </header>

      <form onSubmit={enviarPregunta} className="ia-form">
        <input
          type="text"
          className="ia-input"
          placeholder="Ejemplo: ¿Qué laboratorio está más disponible esta semana?"
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
        />
        <button className="btn-submit" disabled={loading}>
          {loading ? "Analizando..." : "Preguntar"}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      {respuesta && (
        <div className="ia-response">
          <h3>💬 Respuesta de la IA:</h3>
          <p>{respuesta}</p>
        </div>
      )}
    </div>
  );
}
