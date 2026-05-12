"use client";

import React, { useState, useCallback } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useQuestions } from "@/hooks/use-questions";
import { seedQuestionsMockData } from "@/lib/firebase/seed-questions";
import {
  Question,
  Answer,
  OptionKey,
  OPTION_LABELS,
} from "@/types/quiz";
import {
  CheckCircle2,
  XCircle,
  BookOpen,
  ArrowRight,
  Loader2,
  Trophy,
  RotateCcw,
  Database,
  User,
  Wifi,
  ChevronRight,
} from "lucide-react";

// ─── Utility ───────────────────────────────────────────────────────────────
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getOptionText(q: Question, key: OptionKey): string {
  return q[key];
}

// ─── Components ────────────────────────────────────────────────────────────

interface OptionButtonProps {
  label: string;
  text: string;
  selected: boolean;
  confirmed: boolean;
  isCorrect: boolean;
  isWrong: boolean;
  disabled: boolean;
  onClick: () => void;
}

function OptionButton({
  label,
  text,
  selected,
  confirmed,
  isCorrect,
  isWrong,
  disabled,
  onClick,
}: OptionButtonProps) {
  let stateClass =
    "border-border bg-card text-foreground hover:border-primary hover:bg-primary/5";

  if (confirmed && isCorrect) {
    stateClass =
      "border-green-500 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200 dark:border-green-400";
  } else if (confirmed && isWrong && selected) {
    stateClass =
      "border-red-500 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200 dark:border-red-400";
  } else if (selected && !confirmed) {
    stateClass =
      "border-primary bg-primary/10 text-foreground dark:bg-primary/20";
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group flex w-full items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all duration-200 ${stateClass} disabled:cursor-not-allowed disabled:opacity-70`}
    >
      {/* Label badge */}
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors
        ${
          confirmed && isCorrect
            ? "bg-green-500 text-white"
            : confirmed && isWrong && selected
              ? "bg-red-500 text-white"
              : selected && !confirmed
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
        }`}
      >
        {label}
      </span>
      <span className="flex-1 text-sm font-medium leading-snug">{text}</span>
      {confirmed && isCorrect && (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
      )}
      {confirmed && isWrong && selected && (
        <XCircle className="h-5 w-5 shrink-0 text-red-500" />
      )}
    </button>
  );
}

// ─── Step 1: Enter Name ─────────────────────────────────────────────────────

interface NameStepProps {
  onStart: (name: string) => void;
  totalQuestions: number;
  onSeed: () => void;
  seeding: boolean;
}

function NameStep({ onStart, totalQuestions, onSeed, seeding }: NameStepProps) {
  const [name, setName] = useState("");

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-3xl border border-border bg-card p-8 shadow-xl">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </div>

          <h2 className="mb-1 text-center text-2xl font-bold text-foreground">
            English Vocabulary Quiz
          </h2>
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Chủ đề: <strong>Animals</strong> · {totalQuestions} câu hỏi
          </p>

          <div className="mb-4 flex flex-col gap-2">
            <label
              htmlFor="student-name"
              className="text-sm font-semibold text-foreground"
            >
              Họ và tên học sinh
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="student-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && name.trim()) onStart(name.trim());
                }}
                placeholder="Nhập họ tên đầy đủ..."
                className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
            </div>
          </div>

          <button
            id="btn-start-quiz"
            onClick={() => name.trim() && onStart(name.trim())}
            disabled={!name.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Bắt đầu làm bài
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="mt-4 border-t border-border pt-4">
            <button
              id="btn-seed-questions"
              onClick={onSeed}
              disabled={seeding}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              {seeding ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Database className="h-3.5 w-3.5" />
              )}
              {seeding ? "Đang seed..." : "Seed 10 câu hỏi mẫu (Animals)"}
            </button>
          </div>
        </div>

        {/* Realtime badge */}
        <div className="mt-4 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400">
            <Wifi className="h-3 w-3" />
            Realtime · Firebase Firestore
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Quiz ───────────────────────────────────────────────────────────

interface QuizStepProps {
  studentName: string;
  questions: Question[];
  sessionId: string;
  onComplete: (results: AnswerResult[]) => void;
}

export interface AnswerResult {
  question: Question;
  selectedOption: OptionKey;
  isCorrect: boolean;
  answeredAt: string;
}

function QuizStep({
  studentName,
  questions,
  sessionId,
  onComplete,
}: QuizStepProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<OptionKey | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [results, setResults] = useState<AnswerResult[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const question = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;
  const OPTIONS: OptionKey[] = ["option1", "option2", "option3", "option4"];

  const handleConfirm = useCallback(async () => {
    if (!selectedOption || !question) return;

    const correct = selectedOption === question.correctOption;
    const now = new Date().toISOString();

    setIsCorrect(correct);
    setConfirmed(true);
    setSubmitting(true);

    const answerDoc: Omit<Answer, "id"> = {
      questionId: question.id,
      questionContent: question.content,
      studentName,
      selectedOption,
      selectedOptionText: getOptionText(question, selectedOption),
      correctOption: question.correctOption as OptionKey,
      correctOptionText: getOptionText(
        question,
        question.correctOption as OptionKey
      ),
      isCorrect: correct,
      answeredAt: now,
      sessionId,
    };

    try {
      await addDoc(collection(db, "answers"), answerDoc);
    } catch (err) {
      console.error("Failed to save answer:", err);
    } finally {
      setSubmitting(false);
    }

    setResults((prev) => [
      ...prev,
      {
        question,
        selectedOption,
        isCorrect: correct,
        answeredAt: now,
      },
    ]);
  }, [selectedOption, question, studentName, sessionId]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      onComplete([
        ...results,
      ]);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setConfirmed(false);
      setIsCorrect(null);
    }
  }, [currentIndex, questions.length, results, onComplete]);

  if (!question) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Câu <strong className="text-foreground">{currentIndex + 1}</strong> /{" "}
            {questions.length}
          </span>
          <span className="font-medium text-foreground">{studentName}</span>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        {/* Question number badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5">
          <span className="text-xs font-bold text-primary">
            Q{currentIndex + 1}
          </span>
          <ChevronRight className="h-3 w-3 text-primary/60" />
          <span className="text-xs font-medium text-primary/80">Animals</span>
        </div>

        {/* Question */}
        <p className="mb-6 text-lg font-semibold leading-relaxed text-foreground">
          {question.content}
        </p>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {OPTIONS.map((key) => (
            <OptionButton
              key={key}
              label={OPTION_LABELS[key]}
              text={getOptionText(question, key)}
              selected={selectedOption === key}
              confirmed={confirmed}
              isCorrect={confirmed && key === question.correctOption}
              isWrong={confirmed && key !== question.correctOption}
              disabled={confirmed}
              onClick={() => setSelectedOption(key)}
            />
          ))}
        </div>

        {/* Feedback banner */}
        {confirmed && (
          <div
            className={`mt-5 flex items-center gap-3 rounded-xl px-4 py-3 ${
              isCorrect
                ? "bg-green-50 dark:bg-green-950"
                : "bg-red-50 dark:bg-red-950"
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 shrink-0 text-red-500" />
            )}
            <p
              className={`text-sm font-semibold ${
                isCorrect
                  ? "text-green-700 dark:text-green-300"
                  : "text-red-700 dark:text-red-300"
              }`}
            >
              {isCorrect
                ? "🎉 Chính xác!"
                : `❌ Sai rồi. Đáp án đúng: ${OPTION_LABELS[question.correctOption as OptionKey]} — ${getOptionText(question, question.correctOption as OptionKey)}`}
            </p>
          </div>
        )}
      </div>

      {/* Action button */}
      <div className="mt-5 flex justify-end">
        {!confirmed ? (
          <button
            id="btn-confirm-answer"
            onClick={handleConfirm}
            disabled={!selectedOption || submitting}
            className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Xác nhận đáp án
          </button>
        ) : (
          <button
            id="btn-next-question"
            onClick={handleNext}
            className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
          >
            {currentIndex + 1 >= questions.length
              ? "Xem kết quả"
              : "Câu tiếp theo"}
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Step 3: Result ──────────────────────────────────────────────────────────

interface ResultStepProps {
  studentName: string;
  results: AnswerResult[];
  onRestart: () => void;
}

function ResultStep({ studentName, results, onRestart }: ResultStepProps) {
  const correct = results.filter((r) => r.isCorrect).length;
  const total = results.length;
  const pct = Math.round((correct / total) * 100);

  const grade =
    pct >= 90
      ? { label: "Xuất sắc 🏆", color: "text-yellow-500" }
      : pct >= 70
        ? { label: "Giỏi 🎉", color: "text-green-500" }
        : pct >= 50
          ? { label: "Khá 👍", color: "text-blue-500" }
          : { label: "Cần cố gắng thêm 💪", color: "text-red-500" };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Score card */}
      <div className="mb-6 rounded-2xl border border-border bg-card p-8 shadow-sm text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="mb-1 text-2xl font-bold text-foreground">{studentName}</h2>
        <p className="mb-4 text-muted-foreground text-sm">Kết quả Quiz — Animals</p>

        <div className="mb-4 text-5xl font-black text-primary">{pct}%</div>
        <p className={`text-lg font-bold ${grade.color}`}>{grade.label}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Đúng <strong>{correct}</strong> / {total} câu
        </p>
      </div>

      {/* Detail table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border px-5 py-3">
          <h3 className="font-semibold text-foreground text-sm">Chi tiết từng câu</h3>
        </div>
        <div className="divide-y divide-border/60">
          {results.map((r, i) => (
            <div key={i} className="flex gap-3 px-5 py-4">
              {/* Status icon */}
              <div className="mt-0.5 shrink-0">
                {r.isCorrect ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground leading-snug">
                  <span className="text-muted-foreground">Q{i + 1}.</span> {r.question.content}
                </p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                  <span>
                    Chọn:{" "}
                    <strong className={r.isCorrect ? "text-green-600" : "text-red-600"}>
                      {OPTION_LABELS[r.selectedOption]} —{" "}
                      {getOptionText(r.question, r.selectedOption)}
                    </strong>
                  </span>
                  {!r.isCorrect && (
                    <span>
                      Đúng:{" "}
                      <strong className="text-green-600">
                        {OPTION_LABELS[r.question.correctOption as OptionKey]} —{" "}
                        {getOptionText(r.question, r.question.correctOption as OptionKey)}
                      </strong>
                    </span>
                  )}
                  <span className="text-muted-foreground/70">
                    {new Date(r.answeredAt).toLocaleTimeString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex justify-center">
        <button
          id="btn-restart-quiz"
          onClick={onRestart}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-muted"
        >
          <RotateCcw className="h-4 w-4" />
          Làm lại
        </button>
      </div>
    </div>
  );
}

// ─── Main Page Client ────────────────────────────────────────────────────────

type Step = "name" | "quiz" | "result";

export default function QuizPageClient() {
  const { questions, loading, error } = useQuestions();
  const [step, setStep] = useState<Step>("name");
  const [studentName, setStudentName] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [results, setResults] = useState<AnswerResult[]>([]);
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedQuestionsMockData();
    } catch (e) {
      console.error(e);
    } finally {
      setSeeding(false);
    }
  };

  const handleStart = (name: string) => {
    setStudentName(name);
    setSessionId(generateSessionId());
    setStep("quiz");
  };

  const handleComplete = (res: AnswerResult[]) => {
    setResults(res);
    setStep("result");
  };

  const handleRestart = () => {
    setResults([]);
    setStudentName("");
    setSessionId("");
    setStep("name");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Page header */}
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Quiz Tiếng Anh</h1>
        </div>
        <p className="text-muted-foreground text-sm mt-0.5">
          Trắc nghiệm từ vựng chủ đề Animals — 4 lựa chọn
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Đang tải câu hỏi từ Firestore...
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="px-4 lg:px-6">
          <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
            <XCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm font-medium text-destructive">{error}</p>
          </div>
        </div>
      )}

      {/* Steps */}
      {!loading && !error && step === "name" && (
        <NameStep
          onStart={handleStart}
          totalQuestions={questions.length}
          onSeed={handleSeed}
          seeding={seeding}
        />
      )}

      {!loading && !error && step === "quiz" && questions.length > 0 && (
        <QuizStep
          studentName={studentName}
          questions={questions}
          sessionId={sessionId}
          onComplete={handleComplete}
        />
      )}

      {!loading && !error && step === "result" && (
        <ResultStep
          studentName={studentName}
          results={results}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
