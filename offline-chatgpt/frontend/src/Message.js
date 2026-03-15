import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import { SaimanLogo } from "./App";

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

const Message = ({ role, text }) => {
  const isUser = role === "user";

  return (
    <div className={`message-row ${isUser ? "user-msg" : "ai-msg"}`}>
      {!isUser && (
        <div className="ai-avatar" style={{ color: "white" }}>
          <SaimanLogo size={20} />
        </div>
      )}
      <div className="message-bubble">
        {isUser ? (
          text
        ) : (
          <ReactMarkdown
            components={{
              code: CodeBlock,
            }}
          >
            {text}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
};

export default Message;
