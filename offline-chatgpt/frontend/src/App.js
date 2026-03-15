import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { ArrowUp, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import gsap from "gsap";
import "./App.css";

// The new Custom Interwoven 'S' Saiman Logo
const SaimanLogo = ({ size = 60 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0 }}
  >
    {/* Outer circle */}
    <circle
      cx="50"
      cy="50"
      r="44"
      stroke="currentColor"
      strokeWidth="6"
      fill="none"
    />

    {/* Intertwined S shapes representing the Saiman logo */}
    <path
      d="M 65 25 C 20 25, 20 60, 50 50 C 80 40, 80 75, 35 75"
      stroke="currentColor"
      strokeWidth="6"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M 20 50 C 40 60, 60 40, 80 50"
      stroke="currentColor"
      strokeWidth="6"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || "");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return !inline && match ? (
    <div className="code-block-container">
      <div className="code-block-header">
        <span className="code-language">{match[1]}</span>
        <button className="copy-btn" onClick={handleCopy} title="Copy code">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={match[1]}
        PreTag="div"
        className="syntax-highlighter"
        {...props}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code className={`inline-code ${className || ""}`} {...props}>
      {children}
    </code>
  );
};


function App() {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem("chatMessages");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error formatting chat history:", e);
    }
    return [];
  });
  
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  const emptyStateRef = useRef(null);
  const logoRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  useLayoutEffect(() => {
    if (messages.length === 0 && emptyStateRef.current) {
      const tl = gsap.timeline();
      tl.fromTo(
        logoRef.current,
        { opacity: 0, scale: 0.8, y: -20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "power3.out" },
      ).fromTo(
        inputRef.current,
        { opacity: 0, scale: 0.95, y: 10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "power3.out" },
        "-=0.4",
      );
    }
  }, [messages.length]);

  const handleSend = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", content: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Error: Unable to connect to backend." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend(inputValue);
    }
  };

  return (
    <div className="app-container">

      <main
        className={`main-content ${messages.length > 0 ? "chat-active" : ""}`}
      >
        {messages.length === 0 ? (
          <div className="empty-state" ref={emptyStateRef}>
            <div
              className="logo-container"
              style={{ color: "white" }}
              ref={logoRef}
            >
              <SaimanLogo size={80} />
            </div>

            <div className="input-wrapper" ref={inputRef}>
              <div
                className="siri-inline-logo"
                style={{ color: "white", paddingLeft: "8px" }}
              >
                <SaimanLogo size={24} />
              </div>
              <input
                type="text"
                className="input-field"
                placeholder="Type to Saiman..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <button
                className="send-btn"
                onClick={() => handleSend(inputValue)}
                disabled={!inputValue.trim()}
              >
                <ArrowUp size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        ) : (
          <div className="chat-messages">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`message-row ${m.role === "user" ? "user-msg" : "ai-msg"}`}
              >
                {m.role === "ai" && (
                  <div className="ai-avatar" style={{ color: "white" }}>
                    <SaimanLogo size={20} />
                  </div>
                )}
                <div className="message-bubble">
                  {m.role === "ai" ? (
                    <ReactMarkdown
                      components={{
                        code: CodeBlock,
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message-row ai-msg">
                <div className="ai-avatar" style={{ color: "white" }}>
                  <SaimanLogo size={20} />
                </div>
                <div className="message-bubble loading-dots">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </div>
            )}

            <div className="input-container">
              <div className="input-wrapper">
                <div
                  className="siri-inline-logo"
                  style={{ color: "white", paddingLeft: "8px" }}
                >
                  <SaimanLogo size={24} />
                </div>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Type to Saiman..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  className="send-btn"
                  onClick={() => handleSend(inputValue)}
                  disabled={!inputValue.trim()}
                  style={{ opacity: inputValue.trim() ? 1 : 0.3 }}
                >
                  <ArrowUp size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
