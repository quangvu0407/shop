import React, { useState, useEffect, useRef, useContext } from "react";
import ReactMarkdown from "react-markdown";
import axiosInstance from "../customize/axios";
import { ShopContext } from "../context/ShopContext";

const BotAvatar = () => (
  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs shrink-0 shadow-sm">
    ✦
  </div>
);

const TypingDots = () => (
  <div className="flex justify-start items-end gap-2">
    <BotAvatar />
    <div className="bg-white border border-stone-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
      <div className="flex gap-1 items-center h-4">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  </div>
);

const markdownComponents = {
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-indigo-500 underline underline-offset-2 hover:text-indigo-700 font-medium transition-colors"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => <span className="font-semibold">{children}</span>,
  p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="list-disc list-inside space-y-0.5 my-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside space-y-0.5 my-1">{children}</ol>,
  li: ({ children }) => <li className="text-sm">{children}</li>,
};

const Message = ({ msg }) => (
  <div className={`flex items-end gap-2 animate-fadeIn ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
    {msg.role === "assistant" && <BotAvatar />}
    <div
      className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${msg.role === "user"
        ? "bg-gradient-to-br from-stone-800 to-stone-900 text-white rounded-br-sm shadow-md"
        : "bg-white text-stone-800 border border-stone-100 rounded-bl-sm shadow-sm"
        }`}
    >
      {msg.role === "assistant" ? (
        <ReactMarkdown components={markdownComponents}>{msg.content}</ReactMarkdown>
      ) : (
        <span className="whitespace-pre-wrap">{msg.content}</span>
      )}
    </div>
  </div>
);

const ChatBot = () => {
  const { token } = useContext(ShopContext);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [welcomed, setWelcomed] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (!open || welcomed) return;
    setWelcomed(true);
    initChat();
  }, [open]);

  useEffect(() => {
    setWelcomed(false);
    setMessages([]);
  }, [token]);

  const initChat = async () => {
    if (token) {
      try {
        const res = await axiosInstance.get("/chat/history");
        if (res.success && res.messages.length > 0) {
          setMessages(res.messages.map((m) => ({ role: m.role, content: m.content })));
          return;
        }
      } catch { /* fallthrough */ }
    }
    try {
      const res = await axiosInstance.get("/chat/welcome");
      if (res.success) setMessages([{ role: "assistant", content: res.content }]);
    } catch {
      setMessages([{ role: "assistant", content: "Xin chào! Mình có thể giúp gì cho bạn? 😊" }]);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      if (!token) {
        setMessages((prev) => [...prev, { role: "assistant", content: "Bạn cần đăng nhập để chat với mình nhé! 🔐" }]);
        return;
      }
      const res = await axiosInstance.post("/chat/message", { message: text });
      if (res.success) setMessages((prev) => [...prev, { role: "assistant", content: res.message }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Xin lỗi, mình đang gặp sự cố. Thử lại sau nhé!" }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (token) { try { await axiosInstance.delete("/chat/clear"); } catch { /* ignore */ } }
    setMessages([{ role: "assistant", content: "Cuộc trò chuyện đã được làm mới. Mình có thể giúp gì cho bạn? 😊" }]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px";
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-slideUp { animation: slideUp 0.25s ease-out; }
      `}</style>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {open && (
          <div className="w-[340px] sm:w-[380px] h-[540px] bg-white rounded-3xl shadow-2xl border border-stone-100 flex flex-col overflow-hidden animate-slideUp">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-base shadow-md">
                  ✦
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-tight">Trợ lý mua sắm</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="text-xs text-stone-400 leading-tight">Đang hoạt động</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  title="Làm mới"
                  className="text-stone-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="text-stone-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-stone-50 to-white">
              {messages.map((msg, i) => <Message key={i} msg={msg} />)}
              {loading && <TypingDots />}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-stone-100 bg-white">
              <div className="flex gap-2 items-end bg-stone-50 border border-stone-200 rounded-2xl px-3 py-2 focus-within:border-stone-400 focus-within:ring-2 focus-within:ring-stone-800/10 transition-all">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập tin nhắn..."
                  rows={1}
                  className="flex-1 resize-none bg-transparent text-sm text-stone-800 placeholder-stone-400 focus:outline-none max-h-24 overflow-y-auto py-0.5"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                  </svg>
                </button>
              </div>
              <p className="text-center text-[10px] text-stone-400 mt-2">Enter để gửi · Shift+Enter xuống dòng</p>
            </div>
          </div>
        )}

        {/* Floating button */}
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="relative w-10 h-10 rounded-full bg-gradient-to-br from-stone-800 to-stone-900 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center justify-center"
          aria-label="Mở chatbot"
        >
          {!open && (
            <span className="absolute inset-0 rounded-full bg-stone-700 animate-ping opacity-2" />
          )}
          {open ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          )}
        </button>
      </div>
    </>
  );
};

export default ChatBot;
