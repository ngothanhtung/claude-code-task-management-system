import { Metadata } from "next";
import ChartPageClient from "@/modules/chart/components/chart-page-client";

export const metadata: Metadata = {
  title: "Biểu đồ Doanh thu | Dashboard",
  description: "Biểu đồ doanh thu hàng tháng được cập nhật realtime từ Firebase Firestore.",
};

export default function ChartPage() {
  return <ChartPageClient />;
}
