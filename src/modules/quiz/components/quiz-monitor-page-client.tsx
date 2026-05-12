"use client";

import React, { useMemo } from "react";
import { useAnswers } from "@/hooks/use-answers";
import { useQuestions } from "@/hooks/use-questions";
import { Answer, OptionKey, OPTION_LABELS } from "@/types/quiz";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import {
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
  Wifi,
  BarChart2,
  BookOpen,
  Trophy,
  AlertCircle,
  Clock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudentSession {
  studentName: string;
  sessionId: string;
  answers: Answer[];
  correctCount: number;
  totalAnswered: number;
  score: number; // percentage
  lastAnsweredAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CHART_COLORS = [
  "hsl(221, 83%, 53%)",
  "hsl(262, 80%, 60%)",
  "hsl(187, 75%, 45%)",
  "hsl(142, 70%, 45%)",
  "hsl(30, 95%, 55%)",
  "hsl(348, 83%, 60%)",
  "hsl(204, 86%, 53%)",
];

function getScoreColor(score: number): string {
  if (score >= 90) return "text-yellow-500";
  if (score >= 70) return "text-green-500";
  if (score >= 50) return "text-blue-500";
  return "text-red-500";
}

function getScoreBg(score: number): string {
  if (score >= 90) return "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800";
  if (score >= 70) return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800";
  if (score >= 50) return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800";
  return "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800";
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  iconClass = "text-primary",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  iconClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card px-5 py-4 shadow-sm flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <Icon className={`h-5 w-5 ${iconClass}`} />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Student Score Chart ──────────────────────────────────────────────────────

interface ScoreChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { name: string } }>;
}

function ScoreChartTooltip({ active, payload }: ScoreChartTooltipProps) {
  if (active && payload && payload.length) {
    const score = payload[0].value;
    const name = payload[0].payload.name;
    return (
      <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-xl text-sm">
        <p className="font-semibold text-foreground mb-1">{name}</p>
        <p className="text-primary font-bold text-lg">{score}%</p>
      </div>
    );
  }
  return null;
}

function StudentScoreChart({ sessions }: { sessions: StudentSession[] }) {
  const data = sessions
    .slice()
    .sort((a, b) => b.score - a.score)
    .map((s) => ({
      name: s.studentName,
      score: s.score,
      answered: s.totalAnswered,
    }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        margin={{ top: 28, right: 16, left: 0, bottom: 8 }}
        barCategoryGap="30%"
      >
        <defs>
          {CHART_COLORS.map((color, i) => (
            <linearGradient key={i} id={`monGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={1} />
              <stop offset="100%" stopColor={color} stopOpacity={0.6} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          dy={6}
        />
        <YAxis
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <Tooltip content={<ScoreChartTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4, radius: 6 }} />
        <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={56}>
          {data.map((_, index) => (
            <Cell key={index} fill={`url(#monGrad-${index % CHART_COLORS.length})`} />
          ))}
          <LabelList
            dataKey="score"
            position="top"
            formatter={(v: number) => `${v}%`}
            style={{ fontSize: "11px", fill: "hsl(var(--muted-foreground))", fontWeight: 600 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Student Detail Table ─────────────────────────────────────────────────────

function StudentDetailTable({
  session,
  totalQuestions,
}: {
  session: StudentSession;
  totalQuestions: number;
}) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="flex items-center justify-between bg-muted/40 px-4 py-2.5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground">
            {session.studentName}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {session.totalAnswered}/{totalQuestions} câu
          </span>
          <span
            className={`text-sm font-bold ${getScoreColor(session.score)}`}
          >
            {session.score}%
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/60 bg-muted/20">
              <th className="px-3 py-2 text-left text-muted-foreground font-semibold">#</th>
              <th className="px-3 py-2 text-left text-muted-foreground font-semibold">Câu hỏi</th>
              <th className="px-3 py-2 text-left text-muted-foreground font-semibold">Học sinh chọn</th>
              <th className="px-3 py-2 text-left text-muted-foreground font-semibold">Đáp án đúng</th>
              <th className="px-3 py-2 text-center text-muted-foreground font-semibold">Kết quả</th>
              <th className="px-3 py-2 text-left text-muted-foreground font-semibold">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {session.answers.map((ans, i) => (
              <tr
                key={ans.id ?? i}
                className={`border-b border-border/40 ${i % 2 === 0 ? "" : "bg-muted/10"}`}
              >
                <td className="px-3 py-2 font-mono text-muted-foreground">
                  Q{i + 1}
                </td>
                <td className="px-3 py-2 text-foreground max-w-[240px]">
                  <span className="line-clamp-2">{ans.questionContent}</span>
                </td>
                <td className="px-3 py-2">
                  <span className={ans.isCorrect ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                    {OPTION_LABELS[ans.selectedOption as OptionKey]} — {ans.selectedOptionText}
                  </span>
                </td>
                <td className="px-3 py-2 text-green-600 font-medium">
                  {OPTION_LABELS[ans.correctOption as OptionKey]} — {ans.correctOptionText}
                </td>
                <td className="px-3 py-2 text-center">
                  {ans.isCorrect ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500 mx-auto" />
                  )}
                </td>
                <td className="px-3 py-2 text-muted-foreground font-mono whitespace-nowrap">
                  {new Date(ans.answeredAt).toLocaleTimeString("vi-VN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Monitor Page ────────────────────────────────────────────────────────

export default function QuizMonitorPageClient() {
  const { answers, loading: answersLoading, error: answersError } = useAnswers();
  const { questions, loading: questionsLoading } = useQuestions();

  const loading = answersLoading || questionsLoading;
  const totalQuestions = questions.length;

  // Group answers by (studentName + sessionId)
  const sessions: StudentSession[] = useMemo(() => {
    const map = new Map<string, StudentSession>();

    for (const ans of answers) {
      const key = `${ans.sessionId}__${ans.studentName}`;
      if (!map.has(key)) {
        map.set(key, {
          studentName: ans.studentName,
          sessionId: ans.sessionId,
          answers: [],
          correctCount: 0,
          totalAnswered: 0,
          score: 0,
          lastAnsweredAt: ans.answeredAt,
        });
      }
      const session = map.get(key)!;
      session.answers.push(ans);
      if (ans.isCorrect) session.correctCount++;
      session.totalAnswered++;
      if (ans.answeredAt > session.lastAnsweredAt) {
        session.lastAnsweredAt = ans.answeredAt;
      }
    }

    // Compute score
    for (const session of map.values()) {
      session.score =
        totalQuestions > 0
          ? Math.round((session.correctCount / totalQuestions) * 100)
          : 0;
    }

    return Array.from(map.values()).sort(
      (a, b) => b.lastAnsweredAt.localeCompare(a.lastAnsweredAt)
    );
  }, [answers, totalQuestions]);

  const totalStudents = sessions.length;
  const totalAnswers = answers.length;
  const avgScore =
    sessions.length > 0
      ? Math.round(sessions.reduce((s, r) => s + r.score, 0) / sessions.length)
      : 0;
  const completedSessions = sessions.filter(
    (s) => s.totalAnswered >= totalQuestions && totalQuestions > 0
  ).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="px-4 lg:px-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold tracking-tight">
                Quiz Monitor — Giáo viên
              </h1>
            </div>
            <p className="text-muted-foreground text-sm mt-0.5">
              Theo dõi kết quả học sinh realtime · Chủ đề Animals
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-400">
            <Wifi className="h-3 w-3 animate-pulse" />
            Realtime · Firebase Firestore
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Đang kết nối Firestore...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && answersError && (
        <div className="px-4 lg:px-6">
          <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive font-medium">{answersError}</p>
          </div>
        </div>
      )}

      {!loading && !answersError && (
        <>
          {/* Stat Cards */}
          <div className="px-4 lg:px-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              label="Học sinh"
              value={totalStudents}
              sub="đang / đã tham gia"
            />
            <StatCard
              icon={Trophy}
              label="Hoàn thành"
              value={completedSessions}
              sub={`/ ${totalStudents} học sinh`}
              iconClass="text-yellow-500"
            />
            <StatCard
              icon={CheckCircle2}
              label="Điểm TB"
              value={`${avgScore}%`}
              sub="trung bình toàn lớp"
              iconClass="text-green-500"
            />
            <StatCard
              icon={BarChart2}
              label="Tổng lượt trả lời"
              value={totalAnswers}
              sub={`/ ${totalStudents * totalQuestions || "?"} tối đa`}
            />
          </div>

          {/* Empty state */}
          {sessions.length === 0 && (
            <div className="px-4 lg:px-6">
              <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 rounded-2xl border border-dashed border-border bg-muted/20 p-8">
                <Users className="h-12 w-12 text-muted-foreground/40" />
                <div className="text-center">
                  <p className="font-semibold text-foreground">
                    Chưa có học sinh nào làm bài
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Học sinh truy cập{" "}
                    <code className="font-mono text-primary">/quiz</code> để bắt đầu làm bài.
                    Kết quả sẽ xuất hiện ở đây ngay lập tức.
                  </p>
                </div>
              </div>
            </div>
          )}

          {sessions.length > 0 && (
            <>
              {/* Score Chart */}
              <div className="px-4 lg:px-6">
                <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">
                        So sánh thành tích học sinh
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Điểm số (%) · Sắp xếp giảm dần
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <BarChart2 className="h-3.5 w-3.5" />
                      {sessions.length} học sinh
                    </div>
                  </div>
                  <div className="px-2 py-4">
                    <StudentScoreChart sessions={sessions} />
                  </div>
                </div>
              </div>

              {/* Overview Table */}
              <div className="px-4 lg:px-6">
                <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                  <div className="border-b border-border px-6 py-4">
                    <h2 className="text-base font-semibold text-foreground">
                      Bảng tổng hợp học sinh
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/40">
                          <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Học sinh
                          </th>
                          <th className="px-5 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Câu đúng
                          </th>
                          <th className="px-5 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Đã trả lời
                          </th>
                          <th className="px-5 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Điểm
                          </th>
                          <th className="px-5 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Trạng thái
                          </th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Lần cuối
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.map((session, i) => {
                          const done =
                            totalQuestions > 0 &&
                            session.totalAnswered >= totalQuestions;
                          return (
                            <tr
                              key={session.sessionId}
                              className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}
                            >
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                                    {session.studentName.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="font-medium text-foreground">
                                    {session.studentName}
                                  </span>
                                </div>
                              </td>
                              <td className="px-5 py-3 text-center font-semibold text-green-600">
                                {session.correctCount}
                              </td>
                              <td className="px-5 py-3 text-center text-muted-foreground">
                                {session.totalAnswered} / {totalQuestions || "?"}
                              </td>
                              <td className="px-5 py-3 text-center">
                                <span
                                  className={`inline-block rounded-lg border px-2.5 py-0.5 text-sm font-bold ${getScoreBg(session.score)} ${getScoreColor(session.score)}`}
                                >
                                  {session.score}%
                                </span>
                              </td>
                              <td className="px-5 py-3 text-center">
                                {done ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 border border-green-500/20 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Xong
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-400">
                                    <Clock className="h-3 w-3" />
                                    Đang làm
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-3 text-xs text-muted-foreground font-mono">
                                {new Date(session.lastAnsweredAt).toLocaleTimeString("vi-VN")}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Per-student detail */}
              <div className="px-4 lg:px-6">
                <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                  <div className="border-b border-border px-6 py-4">
                    <h2 className="text-base font-semibold text-foreground">
                      Chi tiết từng câu theo học sinh
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Câu nào đúng / sai · Học sinh chọn đáp án nào
                    </p>
                  </div>
                  <div className="p-4 flex flex-col gap-4">
                    {sessions.map((session) => (
                      <StudentDetailTable
                        key={session.sessionId}
                        session={session}
                        totalQuestions={totalQuestions}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
