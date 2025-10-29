import React, { useState } from "react";

export default function ChatIA() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { role: "user", content: input };
    setMessages([...messages, newMessage]);
    setInput("");

    const res = await fetch("http://localhost:8000/chat-ia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: input }),
    });
    const data = await res.json();
    const reply = { role: "assistant", content: data.respuesta };
    setMessages([...messages, newMessage, reply]);
  };

  return (
    <div className="chat-container">
      <h2>💬 Asistente IA del Laboratorio</h2>
      <div className="chat-box">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`msg ${msg.role === "user" ? "user" : "assistant"}`}
          >
            <b>{msg.role === "user" ? "Tú:" : "IA:"}</b> {msg.content}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Haz una pregunta..."
        />
        <button onClick={sendMessage}>Enviar</button>
      </div>
    </div>
  );
}
