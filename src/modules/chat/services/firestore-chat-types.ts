// =========================================================
// Firestore Chat Types
// collections: friends, messages
// =========================================================

/**
 * Firestore collection: "friends"
 * Danh sách bạn bè / conversation list
 */
export interface FirestoreFriend {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: {
    text: string;
    updatedAt: string; // ISO timestamp
    unreadMessageCount: number;
  };
}

/**
 * Firestore collection: "messages"
 * Messages giữa 2 người
 */
export interface FirestoreMessage {
  id?: string;
  text: string;
  updatedAt: string; // ISO timestamp
  from: string;     // sender name hoặc "me"
  to: string;       // recipient name
}

// ─── Adapter: map Firestore → existing UI types ────────────────────────────

import type { Conversation, Message } from "./types/chat-types";

export function friendToConversation(friend: FirestoreFriend): Conversation {
  return {
    id: friend.id,
    type: "direct",
    participants: [friend.id],
    name: friend.name,
    avatar: friend.avatar ?? "",
    lastMessage: {
      id: "",
      content: friend.lastMessage.text,
      timestamp: friend.lastMessage.updatedAt,
      senderId: friend.id,
    },
    unreadCount: friend.lastMessage.unreadMessageCount,
    isPinned: false,
    isMuted: false,
  };
}

export function firestoreMessageToMessage(
  msg: FirestoreMessage,
  docId: string,
  currentUserName: string
): Message {
  const isOwn = msg.from === currentUserName || msg.from === "me";
  return {
    id: docId,
    content: msg.text,
    timestamp: msg.updatedAt,
    senderId: isOwn ? "current-user" : msg.from,
    type: "text",
    isEdited: false,
    reactions: [],
    replyTo: null,
  };
}
