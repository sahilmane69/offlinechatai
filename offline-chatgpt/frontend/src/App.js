import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { ArrowUp, Menu, Plus, MessageSquare, X, User } from "lucide-react";
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';
import Message from "./Message";
import gsap from "gsap";
import "./App.css";

// The new Custom Interwoven 'S' Saiman Logo
export const SaimanLogo = ({ size = 60 }) => (
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


function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      if (saved) {
        if (saved.startsWith("{")) return JSON.parse(saved);
        return { name: "User", mobile: saved };
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  });
  const [chats, setChats] = useState(() => {
    try {
      const saved = localStorage.getItem("chats");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error formatting chat history:", e);
    }
    return [{ id: "1", title: "New Chat", messages: [] }];
  });
  
  const [currentChatId, setCurrentChatId] = useState(() => localStorage.getItem("currentChatId") || "1");
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [userName, setUserName] = useState("");
  const emptyStateRef = useRef(null);
  const logoRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
    localStorage.setItem("currentChatId", currentChatId);
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [chats, currentChatId, user]);

  const currentChat = chats.find(c => c.id === currentChatId) || chats[0];
  const messages = currentChat?.messages || [];

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
    
    setChats((prevChats) => prevChats.map(c => {
      if (c.id === currentChatId) {
        const newTitle = c.messages.length === 0 ? text.slice(0, 30) + (text.length > 30 ? "..." : "") : c.title;
        return { ...c, title: newTitle, messages: [...c.messages, userMsg] };
      }
      return c;
    }));
    
    setInputValue("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, userName: user?.name }),
      });
      const data = await res.json();
      
      setChats((prevChats) => prevChats.map(c => {
        if (c.id === currentChatId) {
          return { ...c, messages: [...c.messages, { role: "ai", content: data.reply }] };
        }
        return c;
      }));
    } catch (err) {
      console.error(err);
      setChats((prevChats) => prevChats.map(c => {
        if (c.id === currentChatId) {
          return { ...c, messages: [...c.messages, { role: "ai", content: "Error: Unable to connect to backend." }] };
        }
        return c;
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend(inputValue);
    }
  };

  const handleNewChat = () => {
    if (window.innerWidth <= 768) setIsSidebarOpen(false);
    if (!user && chats.length >= 1) {
      setShowLoginModal(true);
      return;
    }
    const newId = Date.now().toString();
    setChats([{ id: newId, title: "New Chat", messages: [] }, ...chats]);
    setCurrentChatId(newId);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (mobileNumber.length >= 10 && userName.trim().length > 0) {
      setUser({ name: userName.trim(), mobile: mobileNumber });
      setShowLoginModal(false);
      const newId = Date.now().toString();
      setChats([{ id: newId, title: "New Chat", messages: [] }, ...chats]);
      setCurrentChatId(newId);
    } else {
      alert("Please enter a valid name and mobile number");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setChats([{ id: "1", title: "New Chat", messages: [] }]);
    setCurrentChatId("1");
  };

  return (
    <div className="app-container">
      <div className="background-shader">
        <ShaderGradientCanvas
          style={{
            width: '100%',
            height: '100%',
          }}
          lazyLoad={false}
          fov={45}
          pixelDensity={1}
          pointerEvents="none"
        >
          <ShaderGradient
            animate="on"
            type="waterPlane"
            wireframe={true}
            shader="defaults"
            uTime={19.3}
            uSpeed={0.4}
            uStrength={0.4}
            uDensity={2}
            uFrequency={0}
            uAmplitude={1.3}
            positionX={0}
            positionY={0}
            positionZ={0}
            rotationX={60}
            rotationY={0}
            rotationZ={30}
            color1="#ff00cc"
            color2="#000000"
            color3="#9b9b9b"
            reflection={0.33}

            // View (camera) props
            cAzimuthAngle={195}
            cPolarAngle={64}
            cDistance={3.2}
            cameraZoom={8.5}

            // Effect props
            lightType="3d"
            brightness={0.9}
            envPreset="lobby"
            grain="off"

            // Tool props
            toggleAxis={false}
            zoomOut={false}
            hoverState=""

            // Optional - if using transition features
            enableTransition={false}
          />
        </ShaderGradientCanvas>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
        <div className="sidebar-header">
          <button className="icon-button" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu size={20} />
          </button>
          <button className="new-chat-btn" onClick={handleNewChat}>
            <Plus size={16} />
            <span>New Chat</span>
          </button>
        </div>
        <div className="sidebar-nav">
          {chats.length > 0 && (
            <div className="sidebar-group">
              <div className="sidebar-group-title">History</div>
              {chats.map(c => (
                <button 
                  key={c.id} 
                  className={`chat-history-item ${c.id === currentChatId ? 'active' : ''}`}
                  onClick={() => setCurrentChatId(c.id)}
                >
                  <MessageSquare size={16} />
                  <span className="truncate">{c.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="main-wrapper">
        <div className="top-right-auth">
          {user ? (
            <div className="user-profile-dropdown-container">
              <button 
                className="user-avatar-btn" 
                onClick={() => setShowUserMenu(!showUserMenu)}
                title="Account Info"
              >
                {user.name && user.name.length > 0 ? user.name.charAt(0).toUpperCase() : <User size={18} />}
              </button>
              
              {showUserMenu && (
                <div className="user-dropdown-menu">
                  <div className="user-dropdown-info">
                    <span className="user-dropdown-name">{user.name}</span>
                    <span className="user-dropdown-mobile">{user.mobile}</span>
                  </div>
                  <button className="logout-dropdown-btn" onClick={() => { handleLogout(); setShowUserMenu(false); }}>
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="login-prompt-btn top-btn" onClick={() => setShowLoginModal(true)}>
              Login for more chats
            </button>
          )}
        </div>
        {!isSidebarOpen && (
          <button className="icon-button mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={20} />
          </button>
        )}
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
              <div className="siri-inline-logo">
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
              <Message key={idx} role={m.role} text={m.content} />
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
                <div className="siri-inline-logo">
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

      {showLoginModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowLoginModal(false)}>
              <X size={20} />
            </button>
            <h2>Unlock Unlimited Chats</h2>
            <p className="modal-desc">Enter your mobile number to create multiple chat sessions.</p>
            <form onSubmit={handleLogin}>
              <input 
                type="text" 
                placeholder="What's your name?" 
                className="modal-input" 
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                autoFocus
                required 
              />
              <input 
                type="tel" 
                placeholder="Mobile Number" 
                className="modal-input" 
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                required 
              />
              <button type="submit" className="modal-submit focus:outline-none">
                Login / Continue
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
