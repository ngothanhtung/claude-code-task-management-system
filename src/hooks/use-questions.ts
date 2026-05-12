"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Question } from "@/types/quiz";

export interface UseQuestionsReturn {
  questions: Question[];
  loading: boolean;
  error: string | null;
}

export function useQuestions(): UseQuestionsReturn {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "questions"), orderBy("id", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Question[] = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: d.id ?? doc.id,
            content: d.content as string,
            option1: d.option1 as string,
            option2: d.option2 as string,
            option3: d.option3 as string,
            option4: d.option4 as string,
            correctOption: d.correctOption as string,
          };
        });
        setQuestions(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore questions error:", err);
        setError("Không thể tải câu hỏi từ Firestore.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { questions, loading, error };
}
