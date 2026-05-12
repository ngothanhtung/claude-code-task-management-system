/**
 * Script để seed mock data vào Firestore collection "revenues"
 * Chạy từ browser console hoặc tích hợp vào admin panel
 *
 * Mock data: Tháng 1 đến Tháng 5
 */

import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Revenue } from "@/types/revenue";

export const MOCK_REVENUES: Revenue[] = [
  { id: 1, month: 1, revenue: 85_000_000 },
  { id: 2, month: 2, revenue: 92_000_000 },
  { id: 3, month: 3, revenue: 110_000_000 },
  { id: 4, month: 4, revenue: 98_000_000 },
  { id: 5, month: 5, revenue: 125_000_000 },
];

export async function seedRevenuesMockData(): Promise<void> {
  const revenuesCollection = collection(db, "revenues");

  const promises = MOCK_REVENUES.map((item) =>
    setDoc(doc(revenuesCollection, String(item.id)), {
      id: item.id,
      month: item.month,
      revenue: item.revenue,
    })
  );

  await Promise.all(promises);
  console.log("✅ Mock revenue data seeded successfully!");
}
