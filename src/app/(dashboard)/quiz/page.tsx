import { Metadata } from "next";
import QuizPageClient from "@/modules/quiz/components/quiz-page-client";

export const metadata: Metadata = {
  title: "Quiz Tiếng Anh | Animals",
  description: "Bài kiểm tra trắc nghiệm từ vựng Tiếng Anh chủ đề Animals — 4 lựa chọn, kết nối Firestore realtime.",
};

export default function QuizPage() {
  return <QuizPageClient />;
}
