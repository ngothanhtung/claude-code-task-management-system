"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Revenue } from "@/types/revenue";

export interface UseRevenuesReturn {
  revenues: Revenue[];
  loading: boolean;
  error: string | null;
}

export function useRevenues(): UseRevenuesReturn {
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const revenuesRef = collection(db, "revenues");
    const revenuesQuery = query(revenuesRef, orderBy("month", "asc"));

    const unsubscribe = onSnapshot(
      revenuesQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const data: Revenue[] = snapshot.docs.map((doc) => {
          const docData = doc.data();
          return {
            id: docData.id ?? doc.id,
            month: docData.month as number,
            revenue: docData.revenue as number,
          };
        });

        setRevenues(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore realtime error:", err);
        setError("Không thể kết nối đến Firestore. Vui lòng thử lại.");
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { revenues, loading, error };
}
