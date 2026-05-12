"use client";

import { useEffect, useRef, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { FirestoreFriend, FirestoreMessage } from "./firestore-chat-types";
import {
  friendToConversation,
  firestoreMessageToMessage,
} from "./firestore-chat-types";
import type { Conversation, Message } from "./types/chat-types";

// ─── The current user identifier ─────────────────────────────────────────────
// We use "me" as the `from` value for sent messages.
const CURRENT_USER = "me";

// ─── Friends (conversation list) ─────────────────────────────────────────────

export interface UseFriendsReturn {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
}

export function useFriends(): UseFriendsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "friends"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const friends: FirestoreFriend[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<FirestoreFriend, "id">),
        }));
        // Sort client-side by lastMessage.updatedAt descending
        friends.sort(
          (a, b) =>
            new Date(b.lastMessage.updatedAt).getTime() -
            new Date(a.lastMessage.updatedAt).getTime()
        );
        setConversations(friends.map(friendToConversation));
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore friends error:", err);
        setError("Không thể tải danh sách bạn bè.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { conversations, loading, error };
}

// ─── Messages for a conversation ─────────────────────────────────────────────

export interface UseMessagesReturn {
  messages: Message[];
  loading: boolean;
  sending: boolean;
  sendMessage: (text: string, toFriendId: string, toFriendName: string) => Promise<void>;
}

export function useMessages(friendId: string | null): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const prevFriendId = useRef<string | null>(null);

  useEffect(() => {
    if (!friendId) {
      setMessages([]);
      return;
    }

    // Reset on conversation switch
    if (prevFriendId.current !== friendId) {
      setMessages([]);
      setLoading(true);
      prevFriendId.current = friendId;
    }

    const q = query(
      collection(db, "messages"),
      where("friendId", "==", friendId)
      // Note: sorting client-side to avoid requiring a Firestore composite index
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs: Message[] = snapshot.docs
          .map((d) => {
            const data = d.data() as FirestoreMessage & { friendId: string };
            return firestoreMessageToMessage(data, d.id, CURRENT_USER);
          })
          // Sort by timestamp ascending client-side
          .sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        setMessages(msgs);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore messages error:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [friendId]);


  const sendMessage = async (
    text: string,
    toFriendId: string,
    toFriendName: string
  ) => {
    if (!text.trim() || !toFriendId) return;

    setSending(true);
    const now = new Date().toISOString();

    try {
      // 1. Add message document
      await addDoc(collection(db, "messages"), {
        text: text.trim(),
        updatedAt: now,
        from: CURRENT_USER,
        to: toFriendName,
        friendId: toFriendId,
      });

      // 2. Update friend's lastMessage
      await updateDoc(doc(db, "friends", toFriendId), {
        lastMessage: {
          text: text.trim(),
          updatedAt: now,
          unreadMessageCount: 0,
        },
      });
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  return { messages, loading, sending, sendMessage };
}

// ─── Mark conversation as read ────────────────────────────────────────────────

export async function markConversationAsRead(friendId: string): Promise<void> {
  try {
    await updateDoc(doc(db, "friends", friendId), {
      "lastMessage.unreadMessageCount": 0,
    });
  } catch (err) {
    console.error("Failed to mark as read:", err);
  }
}
