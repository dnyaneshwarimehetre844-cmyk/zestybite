import { useState, useRef, useEffect } from "react";
import api from "../api/axios";
import { useCart } from "../context/CartContext";

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm your ZestyBite assistant. Ask me for recommendations, spice levels, or anything on the menu 🍽️", suggestions: [] },
  ]);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text, suggestions: [] }]);
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.text }));
      const { data } = await api.post("/ai/chat", { message: text, history });
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply, suggestions: data.suggestions || [] }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Sorry, I couldn't reach the assistant. Try again in a moment.", suggestions: [] }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-chat-widget">
      {open && (
        <div className="ai-chat-panel">
          <div className="ai-chat-header">
            <span>ZestyBite Assistant</span>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="ai-chat-body">
            {messages.map((m, i) => (
              <div key={i} className={`ai-msg ${m.role}`}>
                <p>{m.text}</p>
                {m.suggestions?.length > 0 && (
                  <div className="ai-suggestions">
                    {m.suggestions.map((food) => (
                      <div className="ai-suggestion-card" key={food._id}>
                        <img src={food.image} alt={food.name} />
                        <div><strong>{food.name}</strong><span>₹{food.price}</span></div>
                        <button onClick={() => addToCart(food)}>Add</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && <div className="ai-msg assistant">Thinking…</div>}
            <div ref={bottomRef} />
          </div>
          <div className="ai-chat-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about the menu..."
            />
            <button onClick={send} disabled={loading}>Send</button>
          </div>
        </div>
      )}
      <button className="ai-chat-toggle" onClick={() => setOpen((v) => !v)}>{open ? "✕" : "💬"}</button>
    </div>
  );
}