/**
 * Seed mock data cho Firestore collections: friends & messages
 */

import { collection, doc, setDoc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { FirestoreFriend, FirestoreMessage } from "./firestore-chat-types";

const NOW = new Date();
const ts = (minutesAgo: number) =>
  new Date(NOW.getTime() - minutesAgo * 60 * 1000).toISOString();

export const MOCK_FRIENDS: FirestoreFriend[] = [
  {
    id: "sarah-mitchell",
    name: "Sarah Mitchell",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    lastMessage: {
      text: "Thanks for the quick update! 🎉",
      updatedAt: ts(15),
      unreadMessageCount: 2,
    },
  },
  {
    id: "emily-rodriguez",
    name: "Emily Rodriguez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
    lastMessage: {
      text: "Let's review the wireframes...",
      updatedAt: ts(45),
      unreadMessageCount: 1,
    },
  },
  {
    id: "alex-thompson",
    name: "Alex Thompson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    lastMessage: {
      text: "Code review completed, looks good!",
      updatedAt: ts(120),
      unreadMessageCount: 0,
    },
  },
  {
    id: "lisa-chen",
    name: "Lisa Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisa",
    lastMessage: {
      text: "Found a few edge cases in...",
      updatedAt: ts(200),
      unreadMessageCount: 0,
    },
  },
  {
    id: "david-park",
    name: "David Park",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
    lastMessage: {
      text: "Marketing campaign is ready!",
      updatedAt: ts(300),
      unreadMessageCount: 0,
    },
  },
];

// messages[friendId] = array of messages
export const MOCK_MESSAGES: Record<string, Omit<FirestoreMessage, "id">[]> = {
  "sarah-mitchell": [
    {
      text: "Hey! How's the new dashboard coming along?",
      updatedAt: ts(90),
      from: "sarah-mitchell",
      to: "me",
    },
    {
      text: "It's going great! We've implemented the new design system and it looks fantastic.",
      updatedAt: ts(85),
      from: "me",
      to: "sarah-mitchell",
    },
    {
      text: "That's awesome! Can you share a preview?",
      updatedAt: ts(70),
      from: "sarah-mitchell",
      to: "me",
    },
    {
      text: "Thanks for the quick update! The dashboard looks amazing 🎉",
      updatedAt: ts(15),
      from: "sarah-mitchell",
      to: "me",
    },
  ],
  "emily-rodriguez": [
    {
      text: "Let's review the wireframes for the new feature.",
      updatedAt: ts(200),
      from: "emily-rodriguez",
      to: "me",
    },
    {
      text: "Sure! Which section are you focusing on?",
      updatedAt: ts(180),
      from: "me",
      to: "emily-rodriguez",
    },
    {
      text: "The user onboarding flow. I think we need to simplify it.",
      updatedAt: ts(160),
      from: "emily-rodriguez",
      to: "me",
    },
  ],
  "alex-thompson": [
    {
      text: "I finished reviewing your PR.",
      updatedAt: ts(240),
      from: "alex-thompson",
      to: "me",
    },
    {
      text: "Code review completed, looks good! Just a few minor suggestions.",
      updatedAt: ts(120),
      from: "alex-thompson",
      to: "me",
    },
    {
      text: "Thanks Alex! I'll address those now.",
      updatedAt: ts(100),
      from: "me",
      to: "alex-thompson",
    },
  ],
  "lisa-chen": [
    {
      text: "Found a few edge cases in the payment module.",
      updatedAt: ts(200),
      from: "lisa-chen",
      to: "me",
    },
    {
      text: "Can you log them in the issue tracker?",
      updatedAt: ts(190),
      from: "me",
      to: "lisa-chen",
    },
    {
      text: "Already done! Check issue #342 and #343.",
      updatedAt: ts(180),
      from: "lisa-chen",
      to: "me",
    },
  ],
  "david-park": [
    {
      text: "Marketing campaign is ready for review.",
      updatedAt: ts(310),
      from: "david-park",
      to: "me",
    },
    {
      text: "Great! Send it over, I'll check today.",
      updatedAt: ts(300),
      from: "me",
      to: "david-park",
    },
  ],
};

export async function seedFriendsMockData(): Promise<void> {
  const friendsRef = collection(db, "friends");

  const friendPromises = MOCK_FRIENDS.map((friend) =>
    setDoc(doc(friendsRef, friend.id), {
      id: friend.id,
      name: friend.name,
      avatar: friend.avatar ?? "",
      lastMessage: friend.lastMessage,
    })
  );

  await Promise.all(friendPromises);

  // Seed messages as subcollections under each friend
  for (const [friendId, msgs] of Object.entries(MOCK_MESSAGES)) {
    const msgsRef = collection(db, "messages");
    for (const msg of msgs) {
      await addDoc(msgsRef, {
        ...msg,
        friendId, // tag to filter by conversation
      });
    }
  }

  console.log("✅ Friends & messages mock data seeded!");
}
