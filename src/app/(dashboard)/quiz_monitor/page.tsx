import { Metadata } from "next";
import QuizMonitorPageClient from "@/modules/quiz/components/quiz-monitor-page-client";

export const metadata: Metadata = {
  title: "Quiz Monitor — Giáo viên | Animals",
  description: "Theo dõi kết quả trả lời của học sinh realtime qua Firebase Firestore.",
};

export default function QuizMonitorPage() {
  return <QuizMonitorPageClient />;
}
