import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Card, Button, Form, Spinner, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { aiChat } from "../../api/aiApi.js";
import "../../styles/aiChatWidget.css";

function makeSessionId() {
  // ưu tiên randomUUID
  if (typeof crypto !== "undefined" && crypto.randomUUID)
    return crypto.randomUUID();
  // fallback
  return `sess_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export default function AiChatWidget() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState(() => [
    {
      role: "assistant",
      content:
        "Chào bạn 👋 Mình là GoTripViet Assistant. Bạn muốn đi đâu, mấy ngày và ngân sách khoảng bao nhiêu?",
    },
  ]);

  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // init sessionId + load cached chat (optional)
  useEffect(() => {
    const key = "gotripviet_ai_session_id";
    const chatKey = "gotripviet_ai_chat_cache";

    let sid = localStorage.getItem(key);
    if (!sid) {
      sid = makeSessionId();
      localStorage.setItem(key, sid);
    }
    setSessionId(sid);

    // load cache
    const cached = localStorage.getItem(chatKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length) setMessages(parsed);
      } catch {}
    }
  }, []);

  // auto scroll + cache messages
  useEffect(() => {
    const chatKey = "gotripviet_ai_chat_cache";
    localStorage.setItem(chatKey, JSON.stringify(messages.slice(-50)));

    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  const canSend = useMemo(
    () => input.trim().length > 0 && !sending,
    [input, sending]
  );

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || sending) return;

    setSending(true);
    setInput("");

    const userMsg = { role: "user", content };
    const typingMsg = {
      role: "assistant",
      content: "Đang tìm tour phù hợp…",
      typing: true,
    };

    setMessages((prev) => [...prev, userMsg, typingMsg]);

    try {
      const res = await aiChat({ sessionId, message: content });
      const data = res?.data ?? res;

      const assistantMsg = {
        role: "assistant",
        content:
          data?.answer || "Mình đã ghi nhận. Bạn nói rõ thêm giúp mình nhé.",
        suggestedTours: Array.isArray(data?.suggestedTours)
          ? data.suggestedTours
          : [],
        followUpQuestions: Array.isArray(data?.followUpQuestions)
          ? data.followUpQuestions
          : [],
      };

      setMessages((prev) => {
        // remove typing
        const withoutTyping = prev.filter((m) => !m.typing);
        return [...withoutTyping, assistantMsg];
      });
    } catch (e) {
      setMessages((prev) => {
        const withoutTyping = prev.filter((m) => !m.typing);
        return [
          ...withoutTyping,
          {
            role: "assistant",
            content:
              "Mình đang gặp lỗi khi kết nối hệ thống tour. Bạn thử lại sau vài giây hoặc mô tả chi tiết hơn nhé.",
          },
        ];
      });
    } finally {
      setSending(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (canSend) send();
  };

  const ui = (
    <>
      <button
        type="button"
        className="ai-float-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="GoTripViet AI Chat"
        title="Chat với GoTripViet"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path
            fill="currentColor"
            d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm2 4h12v2H6V8Zm0 4h8v2H6v-2Z"
          />
        </svg>
      </button>

      {open && (
        <Card className="ai-panel shadow-lg">
          <Card.Header className="ai-panel-header">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <div className="ai-dot" />
                <div>
                  <div className="fw-semibold">GoTripViet Assistant</div>
                  <div className="ai-subtitle">
                    Tư vấn tour • Ưu đãi • Lịch trình
                  </div>
                </div>
              </div>
              <Button variant="light" size="sm" onClick={() => setOpen(false)}>
                ✕
              </Button>
            </div>
          </Card.Header>

          <Card.Body className="ai-panel-body" ref={listRef}>
            {messages.map((m, idx) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={idx}
                  className={`ai-msg-row ${isUser ? "user" : "bot"}`}
                >
                  <div className={`ai-msg ${isUser ? "user" : "bot"}`}>
                    <div className="ai-msg-text">{m.content}</div>

                    {/* suggested tours */}
                    {!isUser &&
                      Array.isArray(m.suggestedTours) &&
                      m.suggestedTours.length > 0 && (
                        <div className="ai-suggest">
                          <div className="ai-suggest-title">Gợi ý nhanh:</div>
                          {m.suggestedTours.slice(0, 4).map((t) => (
                            <div key={t.id} className="ai-suggest-item">
                              <div className="ai-suggest-main">
                                <div className="ai-suggest-name">{t.title}</div>
                                {(t.location || t.priceFrom) && (
                                  <div className="ai-suggest-meta">
                                    {t.location && <span>{t.location}</span>}
                                    {t.priceFrom && (
                                      <>
                                        <span className="mx-2">•</span>
                                        <span>
                                          Từ <b>{t.priceFrom}</b>
                                        </span>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => navigate(`/product/${t.id}`)}
                              >
                                Xem
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                    {/* follow-up questions */}
                    {!isUser &&
                      Array.isArray(m.followUpQuestions) &&
                      m.followUpQuestions.length > 0 && (
                        <div className="ai-chips">
                          {m.followUpQuestions.slice(0, 3).map((q, i) => (
                            <Badge
                              key={i}
                              bg="light"
                              text="dark"
                              className="ai-chip"
                              onClick={() => send(q)}
                              role="button"
                            >
                              {q}
                            </Badge>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              );
            })}
          </Card.Body>

          <Card.Footer className="ai-panel-footer">
            <Form onSubmit={onSubmit} className="d-flex gap-2">
              <Form.Control
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi của bạn…"
                disabled={sending}
              />
              <Button type="submit" disabled={!canSend}>
                {sending ? <Spinner animation="border" size="sm" /> : "Gửi"}
              </Button>
            </Form>
          </Card.Footer>
        </Card>
      )}
    </>
  );

  // ✅ Portal ra body để "fixed" luôn đúng
  return ReactDOM.createPortal(ui, document.body);
}
