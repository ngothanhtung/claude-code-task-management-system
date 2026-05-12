"use client";

import { useEffect, useState, useCallback } from "react";
import { Menu, X, Database, Loader2, Wifi } from "lucide-react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ConversationList } from "./conversation-list";
import { ChatHeader } from "./chat-header";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { useChat } from "@/modules/chat/services/chat-services";
import {
  useFriends,
  useMessages,
  markConversationAsRead,
} from "@/modules/chat/services/use-firestore-chat";
import { seedFriendsMockData } from "@/modules/chat/services/seed-chat-data";

const CURRENT_USER_FAKE = {
  id: "current-user",
  name: "You",
  email: "you@example.com",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=me",
  status: "online" as const,
  lastSeen: new Date().toISOString(),
  role: "Developer",
  department: "Engineering",
};

export function FirestoreChat() {
  const {
    selectedConversation,
    setSelectedConversation,
    setConversations,
    setSearchQuery,
    searchQuery,
    toggleMute,
  } = useChat();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  // ── Firestore realtime data ──────────────────────────────────────────────
  const { conversations, loading: friendsLoading } = useFriends();
  const { messages, loading: messagesLoading, sendMessage } =
    useMessages(selectedConversation);

  // Sync Firestore conversations → Zustand store (for ConversationList filter/search)
  useEffect(() => {
    if (conversations.length > 0) {
      setConversations(conversations);

      // Auto-select first conversation
      if (!selectedConversation) {
        setSelectedConversation(conversations[0].id);
      }
    }
  }, [conversations, selectedConversation, setConversations, setSelectedConversation]);

  // Mark as read when switching conversations
  useEffect(() => {
    if (selectedConversation) {
      markConversationAsRead(selectedConversation);
    }
  }, [selectedConversation]);

  // Responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentConversation = conversations.find(
    (c) => c.id === selectedConversation
  );

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!selectedConversation || !currentConversation) return;
      await sendMessage(content, selectedConversation, currentConversation.name);
    },
    [selectedConversation, currentConversation, sendMessage]
  );

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMsg(null);
    try {
      await seedFriendsMockData();
      setSeedMsg("✅ Đã seed dữ liệu!");
    } catch {
      setSeedMsg("❌ Lỗi seed data");
    } finally {
      setSeeding(false);
      setTimeout(() => setSeedMsg(null), 3000);
    }
  };

  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id);
    setIsSidebarOpen(false);
  };

  // Filtered conversations (Zustand search state)
  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <TooltipProvider delayDuration={0}>
      <div className="h-full min-h-[600px] max-h-[calc(100vh-200px)] flex rounded-lg border overflow-hidden bg-background flex-col">
        {/* Top bar: realtime badge + seed button */}
        <div className="flex items-center justify-between gap-3 border-b px-4 py-2 bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600 dark:text-green-400">
              <Wifi className="h-3 w-3" />
              Realtime · Firebase Firestore
            </div>
          </div>
          <div className="flex items-center gap-2">
            {seedMsg && (
              <span className="text-xs text-muted-foreground">{seedMsg}</span>
            )}
            <button
              id="btn-seed-chat-data"
              onClick={handleSeed}
              disabled={seeding}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {seeding ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Database className="h-3 w-3" />
              )}
              Seed Mock Data
            </button>
          </div>
        </div>

        {/* Main chat layout */}
        <div className="flex flex-1 min-h-0">
          {/* Mobile sidebar overlay */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Conversations sidebar */}
          <div
            className={`
              w-80 border-r bg-background flex-shrink-0
              ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
              lg:relative lg:block
              fixed inset-y-0 left-0 z-50
              transition-transform duration-300 ease-in-out
            `}
          >
            {/* Mobile close button */}
            <div className="lg:hidden p-4 border-b flex items-center justify-between bg-background">
              <h2 className="text-lg font-semibold">Messages</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(false)}
                className="cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Loading skeleton for friends */}
            {friendsLoading ? (
              <div className="flex flex-col gap-3 p-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="h-12 w-12 rounded-full bg-muted shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-2/3 rounded bg-muted" />
                      <div className="h-2.5 w-full rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ConversationList
                conversations={filteredConversations}
                selectedConversation={selectedConversation}
                onSelectConversation={handleSelectConversation}
              />
            )}
          </div>

          {/* Chat panel */}
          <div className="flex-1 flex flex-col min-w-0 bg-background min-h-0">
            {/* Chat header */}
            <div className="flex items-center h-16 px-4 border-b bg-background flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(true)}
                className="cursor-pointer lg:hidden mr-2"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <ChatHeader
                  conversation={currentConversation || null}
                  users={[CURRENT_USER_FAKE]}
                  onToggleMute={() =>
                    selectedConversation && toggleMute(selectedConversation)
                  }
                />
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 flex flex-col min-h-0">
              {selectedConversation ? (
                <>
                  {/* Loading messages */}
                  {messagesLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <p className="text-xs text-muted-foreground">
                          Đang tải tin nhắn...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <MessageList
                      messages={messages}
                      users={[CURRENT_USER_FAKE]}
                    />
                  )}

                  <MessageInput
                    onSendMessage={handleSendMessage}
                    placeholder={`Nhắn tin cho ${currentConversation?.name ?? ""}...`}
                  />
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">
                      Chào mừng đến Chat
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Chọn một cuộc trò chuyện để bắt đầu nhắn tin
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
