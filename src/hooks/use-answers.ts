"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Answer } from "@/types/quiz";

export interface UseAnswersReturn {
  answers: Answer[];
  loading: boolean;
  error: string | null;
}

export function useAnswers(): UseAnswersReturn {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "answers"),
      orderBy("answeredAt", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Answer[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Answer, "id">),
        }));
        setAnswers(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore answers error:", err);
        setError("Không thể tải dữ liệu câu trả lời.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { answers, loading, error };
}
