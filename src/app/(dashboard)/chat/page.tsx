"use client"

import { FirestoreChat } from "@/modules/chat/components/firestore-chat"

export default function ChatPage() {
  return (
    <div className="px-4 md:px-6">
      <FirestoreChat />
    </div>
  )
}
