import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Phone, Mail, ChevronRight, Sparkles, ArrowLeft, Headphones } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

// ──────────────── FAQ DATA ────────────────
const FAQ_CATEGORIES = [
  {
    id: "booking",
    label: "Đặt tour & thanh toán",
    icon: "🎟️",
    questions: [
      { q: "Làm thế nào để đặt tour?", a: "Bạn chọn tour yêu thích → bấm \"Đặt tour ngay\" → điền thông tin hành khách → chọn phương thức thanh toán → xác nhận. Chúng tôi sẽ gửi email xác nhận ngay lập tức!" },
      { q: "Tôi có thể thanh toán bằng gì?", a: "TravelViet hỗ trợ thanh toán qua **VNPay** (thẻ ATM, Visa, MasterCard) và **MoMo**. Tất cả giao dịch đều được mã hóa bảo mật." },
      { q: "Đặt tour xong có thể hủy không?", a: "Có! Bạn có thể hủy miễn phí trước **72 giờ** khởi hành. Hoàn tiền 100% trong vòng 3-5 ngày làm việc. Hủy trong vòng 72 giờ sẽ bị thu phí 30%." },
      { q: "Tôi muốn thay đổi ngày khởi hành?", a: "Bạn có thể đổi ngày khởi hành miễn phí trước 5 ngày khởi hành. Liên hệ hotline 1900 1234 hoặc email support@travelviet.vn để được hỗ trợ." },
    ],
  },
  {
    id: "tour",
    label: "Thông tin tour",
    icon: "🗺️",
    questions: [
      { q: "Tour có bao gồm ăn uống không?", a: "Tùy từng tour. Thông tin về bữa ăn được ghi rõ trong phần \"Lịch trình chi tiết\" của mỗi tour. Thông thường tour trọn gói bao gồm ăn sáng và một số bữa chính." },
      { q: "Hướng dẫn viên có nói tiếng Anh không?", a: "Có! Chúng tôi có đội ngũ hướng dẫn viên song ngữ Việt - Anh. Nếu bạn cần hỗ trợ ngôn ngữ khác, vui lòng liên hệ trước khi đặt tour." },
      { q: "Tour có phù hợp cho trẻ em không?", a: "Hầu hết các tour của chúng tôi phù hợp cho gia đình có trẻ em từ 3 tuổi trở lên. Trẻ em dưới 12 tuổi được giảm 30% giá tour. Vui lòng kiểm tra điều kiện cụ thể của từng tour." },
      { q: "Tôi cần mang gì khi đi tour?", a: "Bạn cần mang: CMND/CCCD (bắt buộc), trang phục phù hợp với lịch trình, thuốc cá nhân nếu có. Chúng tôi sẽ gửi danh sách đầy đủ qua email sau khi đặt tour thành công." },
    ],
  },
  {
    id: "policy",
    label: "Chính sách & ưu đãi",
    icon: "📋",
    questions: [
      { q: "Có ưu đãi cho khách đặt lần đầu không?", a: "Có! Khách đặt lần đầu được giảm ngay **5%** toàn bộ đơn hàng. Nhập mã **WELCOME5** khi thanh toán. Ưu đãi có giá trị trong 30 ngày kể từ ngày đăng ký." },
      { q: "Chính sách bảo hiểm du lịch?", a: "100% các tour đều có bảo hiểm du lịch cơ bản kèm theo. Nếu muốn gói bảo hiểm nâng cao (tai nạn, y tế, hành lý), bạn có thể đăng ký thêm với phí từ 50.000đ/người/ngày." },
      { q: "Làm sao để nhận hóa đơn VAT?", a: "Khi đặt tour, bạn tích chọn \"Yêu cầu hóa đơn VAT\" và điền thông tin công ty. Hóa đơn sẽ được gửi qua email trong vòng 3 ngày làm việc sau khi tour kết thúc." },
    ],
  },
];

const STAFF_CONTACTS = [
  { icon: Phone, label: "Hotline 24/7", value: "1900 1234", action: "tel:19001234", color: "text-amber-500" },
  { icon: Mail, label: "Email hỗ trợ", value: "support@travelviet.vn", action: "mailto:support@travelviet.vn", color: "text-blue-500" },
];

async function callGeminiAI(messages: { role: string; text: string }[]) {
  try {
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
    const res = await fetch(`${apiBase}/chatbot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    const data = await res.json();
    return data.reply || "Xin lỗi, tôi không thể trả lời lúc này. Vui lòng thử lại!";
  } catch {
    return "Kết nối AI gặp sự cố. Vui lòng liên hệ nhân viên để được hỗ trợ.";
  }
}

// ──────────────── TYPES ────────────────
type Mode = "home" | "faq" | "faq-detail" | "ai" | "staff" | "history";
interface Msg { role: "user" | "bot"; text: string; time: string }
interface ChatSession {
  id: string;
  title: string;
  messages: Msg[];
  createdAt: number;
}

function getTime() {
  return new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

// ──────────────── COMPONENT ────────────────
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("home");
  const [selectedCat, setSelectedCat] = useState<(typeof FAQ_CATEGORIES)[0] | null>(null);

  const { user } = useAuthStore();
  const avatarUrl = user?.avatar
    ? (user.avatar.startsWith('/storage')
      ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'}${user.avatar}`
      : user.avatar)
    : null;

  const storageKey = `travelviet_chat_sessions_${user?.id || "guest"}`;

  // Multiple sessions state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load sessions when user changes
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setSessions(JSON.parse(saved));
    } else {
      setSessions([]);
      setActiveSessionId(null);
      setMode("home");
    }
  }, [storageKey]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const messages = activeSession?.messages || [];

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(sessions));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, storageKey]);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  const createNewSession = (initialBotText?: string) => {
    const greeting = initialBotText ??
      "Xin chào! Em là chuyên viên tư vấn của TravelViet 🤖✨\nEm có thể giúp gì cho Anh/Chị trong chuyến du lịch sắp tới ạ?";
    const newSession: ChatSession = {
      id: generateId(),
      title: "Cuộc hội thoại mới",
      messages: [{ role: "bot", text: greeting, time: getTime() }],
      createdAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setMode("ai");
  };

  const startAI = () => {
    if (sessions.length > 0) {
      setMode("history");
    } else {
      createNewSession();
    }
  };

  const deleteSession = (e: any, id: string) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setDeletingId(id);
  };

  const confirmDelete = (e: any, id: string) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) setActiveSessionId(null);
    setDeletingId(null);
  };

  const sendAI = async () => {
    if (!input.trim() || loading || !activeSessionId) return;

    const userMsg: Msg = { role: "user", text: input.trim(), time: getTime() };

    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        // Update title if it's the first user message
        const newTitle = s.messages.length <= 1 ? userMsg.text.substring(0, 30) + "..." : s.title;
        return { ...s, title: newTitle, messages: [...s.messages, userMsg] };
      }
      return s;
    }));

    setInput("");
    setLoading(true);

    const history = [...messages, userMsg];
    const apiHistory = history.map((m) => ({ role: m.role, text: m.text }));
    const reply = await callGeminiAI(apiHistory);

    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return { ...s, messages: [...s.messages, { role: "bot", text: reply, time: getTime() }] };
      }
      return s;
    }));

    setLoading(false);
  };

  const answerFAQ = (q: string, a: string) => {
    const userMsg: Msg = { role: "user", text: q, time: getTime() };
    const botMsg: Msg = { role: "bot", text: a, time: getTime() };

    const newSession: ChatSession = {
      id: generateId(),
      title: q.substring(0, 30) + "...",
      messages: [userMsg, botMsg],
      createdAt: Date.now()
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setMode("ai");
  };

  const goBack = () => {
    if (mode === "faq-detail") { setMode("faq"); setSelectedCat(null); }
    else if (mode === "faq") setMode("home");
    else if (mode === "ai") {
      if (sessions.length > 1) setMode("history");
      else setMode("home");
    }
    else if (mode === "history") setMode("home");
    else if (mode === "staff") setMode("home");
    else setMode("home");
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end gap-2">
        {!open && isHomePage && (
          <div className="bg-white text-gray-800 text-sm rounded-xl shadow-lg px-4 py-2 animate-bounce border border-gray-100 max-w-[200px]">
            💬 Bạn cần hỗ trợ gì không?
          </div>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="relative h-14 w-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none"
          style={{ background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)" }}
        >
          {open ? <X className="h-6 w-6 text-white" /> : <MessageCircle className="h-6 w-6 text-white" />}
          {!open && unread > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unread}
            </span>
          )}
        </button>
      </div>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-20 right-6 z-[1000] w-[370px] h-[500px] max-h-[calc(100vh-120px)] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
          style={{ background: "#fff" }}>

          {/* Header */}
          <div className="flex items-center gap-3 p-4 text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)" }}>
            {mode !== "home" && (
              <button onClick={goBack} className="hover:bg-white/20 rounded-full p-1 transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              {mode === "ai" ? <Sparkles className="h-5 w-5" /> : mode === "staff" ? <Headphones className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight">
                {mode === "ai" ? "AI Tư Vấn Du Lịch" : mode === "staff" ? "Liên Hệ Nhân Viên" : mode === "faq" || mode === "faq-detail" ? "Câu Hỏi Thường Gặp" : mode === "history" ? "Lịch sử trò chuyện" : "TravelViet Hỗ Trợ"}
              </p>
              <p className="text-xs text-white/75">
                {mode === "ai" ? "Trực tuyến" : mode === "history" ? `${sessions.length} cuộc hội thoại` : "Phản hồi trong vài phút"}
              </p>
            </div>
            <button onClick={() => setOpen(false)} className="hover:bg-white/20 rounded-full p-1 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* HOME */}
          {mode === "home" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="h-4 w-4 text-amber-600" />
                  <span className="text-xs text-gray-500">TravelViet Bot</span>
                </div>
                <p className="text-sm text-gray-700">Xin chào! 👋 Tôi có thể giúp gì cho bạn hôm nay?</p>
              </div>

              {[
                { icon: "❓", label: "Câu hỏi thường gặp", sub: "Tìm câu trả lời nhanh", action: () => setMode("faq"), color: "hover:border-blue-400" },
                { icon: "🤖", label: "Chat với AI", sub: "Tư vấn du lịch thông minh", action: startAI, color: "hover:border-purple-400" },
                { icon: "👨‍💼", label: "Liên hệ nhân viên", sub: "Hotline & Email hỗ trợ", action: () => setMode("staff"), color: "hover:border-amber-400" },
              ].map((item) => (
                <button key={item.label} onClick={item.action}
                  className={`w-full flex items-center gap-3 bg-white rounded-xl p-3.5 shadow-sm border border-gray-100 ${item.color} hover:shadow-md transition-all text-left`}>
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.sub}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              ))}
            </div>
          )}

          {/* HISTORY LIST */}
          {mode === "history" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              <button onClick={() => createNewSession()}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white rounded-xl border-2 border-dashed border-amber-300 text-amber-700 text-sm font-bold hover:bg-amber-50 transition-all mb-4">
                <Sparkles className="h-4 w-4" />
                Bắt đầu chat mới
              </button>

              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold px-1 mb-2">Gần đây</p>

              {sessions.map((s) => (
                <div key={s.id}
                  className="group relative w-full flex items-center gap-3 bg-white rounded-xl p-3.5 shadow-sm border border-gray-100 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer text-left"
                  onClick={() => { setActiveSessionId(s.id); setMode("ai"); }}>
                  <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <p className="text-sm font-semibold text-gray-800 truncate">{s.title}</p>
                    <p className="text-[10px] text-gray-400">{new Date(s.createdAt).toLocaleDateString("vi-VN")}</p>
                  </div>

                  {deletingId === s.id ? (
                    <div className="absolute inset-0 bg-white/95 flex items-center justify-between px-4 rounded-xl z-[10000]">
                      <span className="text-[10px] text-red-500 font-bold uppercase">Xác nhận xóa?</span>
                      <div className="flex gap-2">
                        <button onClick={(e) => { e.stopPropagation(); setDeletingId(null); }} className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-lg hover:bg-gray-200 transition-all">Hủy</button>
                        <button onClick={(e) => confirmDelete(e, s.id)} className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded-lg hover:bg-red-600 transition-all">Xóa ngay</button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={(e) => deleteSession(e, s.id)}
                      className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-gray-400 hover:text-red-500 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all z-[9999] cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {sessions.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  <Bot className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Chưa có lịch sử trò chuyện</p>
                </div>
              )}
            </div>
          )}

          {/* FAQ CATEGORY LIST */}
          {mode === "faq" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              <p className="text-xs text-gray-500 px-1">Chọn chủ đề bạn cần hỗ trợ:</p>
              {FAQ_CATEGORIES.map((cat) => (
                <button key={cat.id} onClick={() => { setSelectedCat(cat); setMode("faq-detail"); }}
                  className="w-full flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-amber-400 hover:shadow-md transition-all text-left">
                  <span className="text-2xl">{cat.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{cat.label}</p>
                    <p className="text-xs text-gray-500">{cat.questions.length} câu hỏi</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              ))}
            </div>
          )}

          {/* FAQ DETAIL */}
          {mode === "faq-detail" && selectedCat && (
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
              <p className="text-xs text-gray-500 px-1 mb-3">{selectedCat.icon} {selectedCat.label}</p>
              {selectedCat.questions.map((item, i) => (
                <button key={i} onClick={() => answerFAQ(item.q, item.a)}
                  className="w-full flex items-start gap-2 bg-white rounded-xl p-3.5 shadow-sm border border-gray-100 hover:border-amber-400 hover:shadow-md transition-all text-left">
                  <span className="text-amber-500 font-bold text-sm mt-0.5 flex-shrink-0">Q</span>
                  <p className="text-sm text-gray-700 flex-1">{item.q}</p>
                  <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                </button>
              ))}
              <button onClick={() => createNewSession("Bạn không tìm thấy câu trả lời? Cứ đặt câu hỏi cho tôi, tôi sẽ hỗ trợ ngay! 🤖")}
                className="w-full flex items-center justify-center gap-2 mt-3 py-3 rounded-xl border-2 border-dashed border-amber-300 text-amber-700 text-sm font-medium hover:bg-amber-50 transition-colors">
                <Sparkles className="h-4 w-4" />
                Không tìm thấy? Hỏi AI ngay
              </button>
            </div>
          )}

          {/* AI CHAT */}
          {mode === "ai" && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" style={{ minHeight: 0 }}>
                {messages.map((m, i) => (
                  <div key={i} className={`flex items-end gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${m.role === "bot" ? "bg-amber-100" : "bg-primary/10 border border-primary/20"}`}>
                      {m.role === "bot" ? (
                        <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                      ) : avatarUrl ? (
                        <img src={avatarUrl} alt={user?.name} className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-3.5 w-3.5 text-primary" />
                      )}
                    </div>
                    <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${m.role === "bot" ? "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none" : "bg-primary text-primary-foreground shadow-sm rounded-tr-none"}`}>
                      {m.text}
                      <div className="text-[10px] mt-1 opacity-50 text-right">{m.time}</div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-end gap-2">
                    <div className="h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center">
                      <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-gray-100">
                      <div className="flex gap-1 items-center">
                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
              <div className="p-3 bg-white border-t border-gray-100 flex-shrink-0">
                <div className="flex gap-2 items-center">
                  <input
                    className="flex-1 text-sm rounded-full border border-gray-200 px-4 py-2.5 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-gray-800 bg-white"
                    placeholder="Nhập câu hỏi..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendAI()}
                    disabled={loading}
                  />
                  <button onClick={sendAI} disabled={loading || !input.trim()}
                    className="h-10 w-10 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 disabled:opacity-50 flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)" }}>
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <button onClick={() => setMode("staff")} className="w-full mt-2 text-xs text-gray-400 hover:text-amber-600 transition-colors flex items-center justify-center gap-1">
                  <Headphones className="h-3 w-3" /> Chuyển sang nhân viên hỗ trợ
                </button>
              </div>
            </>
          )}

          {/* STAFF CONTACT */}
          {mode === "staff" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                  <Headphones className="h-7 w-7 text-amber-600" />
                </div>
                <p className="font-semibold text-gray-800">Đội ngũ hỗ trợ TravelViet</p>
                <p className="text-xs text-gray-500 mt-1">Sẵn sàng 24/7 · Phản hồi trong 5 phút</p>
              </div>
              {STAFF_CONTACTS.map((c) => (
                <a key={c.label} href={c.action}
                  className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-amber-400 hover:shadow-md transition-all">
                  <div className="h-11 w-11 rounded-full bg-gray-50 border flex items-center justify-center flex-shrink-0">
                    <c.icon className={`h-5 w-5 ${c.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{c.label}</p>
                    <p className="text-sm font-semibold text-gray-800">{c.value}</p>
                  </div>
                </a>
              ))}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 text-center">
                ⏰ Giờ hỗ trợ trực tiếp: 8:00 - 22:00 hàng ngày
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
