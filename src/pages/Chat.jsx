import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { SOCKET_BASE_URL } from "../api/apiConfig.js";

import { getCurrentUser } from "../api/authApi";
import {
  getMyChats,
  getOrCreateChat,
  getChatMessages,
  sendChatMessage,
} from "../api/chatApi";
import { getLawyers } from "../api/lawyerApi";

const Chat = () => {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [partners, setPartners] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openingChatId, setOpeningChatId] = useState(null);
  const [lawyersError, setLawyersError] = useState("");
  const [backendError, setBackendError] = useState("");
  const [chatError, setChatError] = useState("");
  const selectedChatRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const appendUniqueMessage = (incomingMessage) => {
    setMessages((prev) => {
      if (prev.some((item) => item.id === incomingMessage.id)) {
        return prev;
      }
      return [...prev, incomingMessage];
    });
  };

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    let isMounted = true;
    let newSocket = null;

    const initializeChat = async () => {
      const isBackendAvailable = await checkBackend();

      if (!isMounted) {
        return;
      }

      if (!isBackendAvailable) {
        setLoading(false);
        return;
      }

      newSocket = io(SOCKET_BASE_URL, {
        reconnection: false,
      });

      newSocket.emit("join-user", user.id);
      newSocket.on("connect_error", () => {
        if (isMounted) {
          setBackendError(`Chat server is unavailable at ${SOCKET_BASE_URL}.`);
        }
      });

    newSocket.on("new-message", (msg) => {
      if (selectedChatRef.current?.id === msg.chatId) {
        appendUniqueMessage(msg);
      }

        setChats((prev) =>
          prev.map((chat) =>
            chat.id === msg.chatId
              ? { ...chat, lastMessage: msg.message, lastMessageAt: msg.createdAt }
              : chat
          )
        );
      });

      setSocket(newSocket);
      await loadData();
    };

    initializeChat();

    return () => {
      isMounted = false;
      newSocket?.close();
    };
  }, []);

  const checkBackend = async () => {
    try {
      const response = await fetch(`${SOCKET_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error("Backend health check failed");
      }
      setBackendError("");
      return true;
    } catch {
      setBackendError(`Backend is not reachable at ${SOCKET_BASE_URL}.`);
      setLawyersError("");
      setChats([]);
      setPartners([]);
      return false;
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      if (user.role === "client") {
        const [myChats, lawyers] = await Promise.all([getMyChats(), getLawyers()]);
        setChats(myChats);
        setPartners(lawyers.filter((lawyer) => lawyer.userId));
        setLawyersError("");
      } else {
        const myChats = await getMyChats();
        setChats(myChats);
        setPartners([]);
      }
    } catch (error) {
      if (error?.code === "ERR_NETWORK" || !error?.response) {
        setBackendError(`Backend is not reachable at ${SOCKET_BASE_URL}.`);
        setChats([]);
        setPartners([]);
      } else if (user.role === "client") {
        setLawyersError(error?.response?.data?.error || "Failed to load lawyers.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadChatThread = async (chatData) => {
    setSelectedChat(chatData);
    setChatError("");
    const msgs = await getChatMessages(chatData.id);
    setMessages(msgs);

    if (socket) {
      socket.emit("join-chat", chatData.id);
    }
  };

  const openChat = async (partner) => {
    const targetUserId = partner?.userId || partner?.id;

    if (!targetUserId) return;

    try {
      setOpeningChatId(targetUserId);
      const chatData = await getOrCreateChat(targetUserId);
      setSelectedChat(chatData);
      setChats((prev) => {
        const existing = prev.find((chat) => chat.id === chatData.id);
        if (existing) {
          return prev.map((chat) => (chat.id === chatData.id ? { ...chat, ...chatData } : chat));
        }
        return [chatData, ...prev];
      });
      await loadChatThread(chatData);
    } catch (error) {
      setChatError(error?.response?.data?.error || "Unable to open this chat right now.");
    } finally {
      setOpeningChatId(null);
    }
  };

  const openExistingChat = async (chat) => {
    try {
      setOpeningChatId(chat.id);
      await loadChatThread(chat);
    } catch (error) {
      setChatError(error?.response?.data?.error || "Unable to load chat messages.");
    } finally {
      setOpeningChatId(null);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const sent = await sendChatMessage(selectedChat.id, newMessage);
      appendUniqueMessage(sent);
      setChatError("");
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === selectedChat.id
            ? { ...chat, lastMessage: sent.message, lastMessageAt: sent.createdAt }
            : chat
        )
      );
      setNewMessage("");
    } catch (error) {
      setChatError(error?.response?.data?.error || "Unable to send message.");
    }
  };

  if (loading) return <div className="app-shell p-8 text-center text-slate-700">Loading chat...</div>;
  if (!user) return <div className="app-shell p-8 text-center text-slate-700">Please login</div>;

  const recentChats = chats.filter((chat) => chat.partner);

  return (
    <div className="app-shell p-4 sm:p-6">
      <div className="app-container">
        <div className="mb-8">
          <p className="page-eyebrow">Messaging</p>
          <h1 className="mt-2 text-4xl font-bold text-primary">
          {user.role === "client" ? "Lawyer Profiles & Chat" : "Client Chat"}
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            {user.role === "client" ? (
              <div className="space-y-6">
                <div className="surface-card p-4">
                  <h2 className="mb-4 text-2xl font-bold text-primary">Available Lawyers</h2>
                  {backendError && (
                    <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                      {backendError}
                    </div>
                  )}
                  {lawyersError && (
                    <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {lawyersError}
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="data-table w-full">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Specialization</th>
                          <th>Experience</th>
                          <th>Rating</th>
                          <th>Bio</th>
                          <th className="text-right">Chat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {partners.map((partner) => (
                          <tr key={partner.profileId}>
                            <td>
                              <div className="font-semibold text-primary">{partner.name}</div>
                              <div className="text-xs text-slate-500">{partner.email || "No email listed"}</div>
                            </td>
                            <td>{partner.specialization}</td>
                            <td>{partner.experience} yrs</td>
                            <td>{Number(partner.rating).toFixed(1)}</td>
                            <td className="max-w-xs text-xs text-slate-500">
                              {partner.bio || "No profile summary available."}
                            </td>
                            <td className="text-right">
                              <button
                                onClick={() => openChat(partner)}
                                disabled={openingChatId === partner.userId}
                                className="btn-secondary rounded-2xl px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {openingChatId === partner.userId ? "Opening..." : "Start Chat"}
                              </button>
                            </td>
                          </tr>
                        ))}
                        {partners.length === 0 && (
                          <tr>
                            <td colSpan="6" className="py-8 text-center text-slate-500">
                              No lawyers available right now.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="surface-card p-4 max-h-72 overflow-y-auto space-y-2">
                  <h3 className="mb-3 text-lg font-bold text-primary">Recent Chats</h3>
                  {recentChats.length === 0 && (
                    <p className="text-sm text-slate-500">Start a conversation from the lawyer table.</p>
                  )}
                  {recentChats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => openExistingChat(chat)}
                      className={`w-full p-3 rounded-xl border text-left transition-all ${
                        selectedChat?.id === chat.id
                          ? "border-secondary bg-secondary/10"
                          : "border-border hover:border-secondary/40"
                      }`}
                    >
                      <div className="font-semibold text-primary">{chat.partner?.name || "Chat"}</div>
                      <div className="text-xs text-slate-500">{chat.partner?.role || "lawyer"}</div>
                      <div className="truncate text-xs text-slate-500">
                        {chat.lastMessage || "No messages yet"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="surface-card p-4 max-h-96 overflow-y-auto space-y-2">
                <h2 className="mb-4 text-2xl font-bold text-primary">Chats</h2>
                {backendError && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                    {backendError}
                  </div>
                )}
                {recentChats.length === 0 && (
                  <p className="text-sm text-slate-500">No client chats yet.</p>
                )}
                {recentChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => openExistingChat(chat)}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                        selectedChat?.id === chat.id
                          ? "border-secondary bg-secondary/10"
                          : "border-border hover:border-secondary/40"
                      }`}
                  >
                    <div className="font-semibold text-primary">{chat.partner?.name || "Chat"}</div>
                    <div className="text-xs text-slate-500">{chat.partner?.role || "user"}</div>
                    <div className="truncate text-xs text-slate-500">
                      {chat.lastMessage || "No messages"}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            {selectedChat ? (
              <>
                {chatError && (
                  <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {chatError}
                  </div>
                )}
                <div className="surface-card mb-6 flex h-96 flex-col overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-200 p-4">
                    <h3 className="text-xl font-bold text-primary">
                      {selectedChat.partner?.name || "Chat"}
                    </h3>
                    <span className="text-sm text-slate-500">Chat #{selectedChat.id}</span>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.senderId === user.id ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-md p-3 rounded-2xl ${
                            msg.senderId === user.id
                              ? "bg-primary text-white"
                              : "border border-slate-200 bg-surface-alt text-primary"
                          }`}
                        >
                          <p>{msg.message}</p>
                          <p className="text-xs opacity-75 mt-1">
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                <form onSubmit={handleSend} className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type message..."
                    className="form-input flex-1"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="btn-primary rounded-2xl px-6 py-3 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="empty-state flex h-96 flex-col items-center justify-center">
                <div className="mb-4 text-4xl">Chat</div>
                <h3 className="mb-2 text-xl font-bold text-primary">No chat selected</h3>
                <p className="text-slate-500">
                  {user.role === "client"
                    ? "Choose a lawyer from the table to start messaging."
                    : "Select an existing conversation to continue messaging."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
