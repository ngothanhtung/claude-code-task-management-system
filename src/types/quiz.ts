// =========================================================
// Quiz Types — Firestore collections: questions & answers
// =========================================================

export interface Question {
  id: string | number;
  content: string;       // The question text (English vocabulary)
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctOption: string; // "option1" | "option2" | "option3" | "option4"
}

export interface Answer {
  id?: string;
  questionId: string | number;
  questionContent: string;
  studentName: string;
  selectedOption: string;      // "option1" | "option2" | "option3" | "option4"
  selectedOptionText: string;  // The actual text of the selected option
  correctOption: string;
  correctOptionText: string;
  isCorrect: boolean;
  answeredAt: string;          // ISO timestamp
  sessionId: string;           // groups a student's full quiz attempt
}

export type OptionKey = "option1" | "option2" | "option3" | "option4";

export const OPTION_LABELS: Record<OptionKey, string> = {
  option1: "A",
  option2: "B",
  option3: "C",
  option4: "D",
};
