"use client";

import React from "react";
import { useRevenues } from "@/hooks/use-revenues";
import { RevenueBarChart } from "@/modules/chart/components/revenue-bar-chart";
import { seedRevenuesMockData, MOCK_REVENUES } from "@/lib/firebase/seed-revenues";
import { TrendingUp, Database, RefreshCw, Loader2, AlertCircle, Wifi } from "lucide-react";

function formatVND(value: number): string {
  return value.toLocaleString("vi-VN") + " đ";
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card px-5 py-4 shadow-sm flex flex-col gap-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default function ChartPageClient() {
  const { revenues, loading, error } = useRevenues();
  const [seeding, setSeeding] = React.useState(false);
  const [seedMsg, setSeedMsg] = React.useState<string | null>(null);

  const totalRevenue = revenues.reduce((sum, r) => sum + r.revenue, 0);
  const avgRevenue = revenues.length > 0 ? totalRevenue / revenues.length : 0;
  const maxRevenue = revenues.length > 0 ? Math.max(...revenues.map((r) => r.revenue)) : 0;

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMsg(null);
    try {
      await seedRevenuesMockData();
      setSeedMsg("✅ Đã seed mock data thành công!");
    } catch (e) {
      setSeedMsg("❌ Lỗi khi seed data. Xem console để biết thêm.");
      console.error(e);
    } finally {
      setSeeding(false);
      setTimeout(() => setSeedMsg(null), 4000);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="px-4 lg:px-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">
                Biểu đồ Doanh thu
              </h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Doanh thu theo từng tháng — dữ liệu realtime từ Firestore
            </p>
          </div>

          {/* Seed Button */}
          <div className="flex items-center gap-3">
            {seedMsg && (
              <span className="text-sm font-medium text-muted-foreground">
                {seedMsg}
              </span>
            )}
            <button
              id="btn-seed-mock-data"
              onClick={handleSeed}
              disabled={seeding}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm transition-all hover:bg-accent hover:text-accent-foreground disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {seeding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              {seeding ? "Đang seed..." : "Seed Mock Data"}
            </button>
          </div>
        </div>
      </div>

      {/* Realtime Badge */}
      <div className="px-4 lg:px-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400">
          <Wifi className="h-3 w-3" />
          Kết nối Realtime · Firebase Firestore
        </div>
      </div>

      {/* Stats Cards */}
      {!loading && !error && revenues.length > 0 && (
        <div className="px-4 lg:px-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Tổng doanh thu"
            value={formatVND(totalRevenue)}
            sub={`Từ ${revenues.length} tháng`}
          />
          <StatCard
            label="Trung bình / tháng"
            value={formatVND(Math.round(avgRevenue))}
            sub="Doanh thu bình quân"
          />
          <StatCard
            label="Doanh thu cao nhất"
            value={formatVND(maxRevenue)}
            sub={`Tháng ${revenues.find((r) => r.revenue === maxRevenue)?.month}`}
          />
        </div>
      )}

      {/* Chart Card */}
      <div className="px-4 lg:px-6">
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Doanh thu hàng tháng
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Collection: <code className="font-mono">revenues</code>
              </p>
            </div>
            {!loading && !error && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <RefreshCw className="h-3 w-3" />
                {revenues.length} bản ghi
              </div>
            )}
          </div>

          {/* Card Body */}
          <div className="px-2 py-6">
            {loading && (
              <div className="flex flex-col items-center justify-center h-80 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Đang tải dữ liệu từ Firestore...
                </p>
              </div>
            )}

            {!loading && error && (
              <div className="flex flex-col items-center justify-center h-80 gap-3">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-destructive font-medium">{error}</p>
                <p className="text-xs text-muted-foreground">
                  Kiểm tra kết nối mạng và cấu hình Firebase.
                </p>
              </div>
            )}

            {!loading && !error && revenues.length === 0 && (
              <div className="flex flex-col items-center justify-center h-80 gap-3">
                <Database className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground font-medium">
                  Chưa có dữ liệu trong collection{" "}
                  <code className="font-mono">revenues</code>
                </p>
                <p className="text-xs text-muted-foreground">
                  Nhấn nút{" "}
                  <strong>&quot;Seed Mock Data&quot;</strong> ở trên để thêm dữ
                  liệu mẫu.
                </p>
              </div>
            )}

            {!loading && !error && revenues.length > 0 && (
              <RevenueBarChart revenues={revenues} />
            )}
          </div>
        </div>
      </div>

      {/* Mock Data Preview Table */}
      {!loading && !error && revenues.length > 0 && (
        <div className="px-4 lg:px-6">
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-base font-semibold text-foreground">
                Dữ liệu chi tiết
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Tháng
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Doanh thu (VNĐ)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {revenues.map((r, i) => (
                    <tr
                      key={r.id}
                      className={`border-b border-border/50 transition-colors hover:bg-muted/30 ${i % 2 === 0 ? "" : "bg-muted/10"}`}
                    >
                      <td className="px-6 py-3 font-mono text-muted-foreground">
                        {r.id}
                      </td>
                      <td className="px-6 py-3 font-medium">Tháng {r.month}</td>
                      <td className="px-6 py-3 text-right font-semibold tabular-nums text-primary">
                        {r.revenue.toLocaleString("vi-VN")} đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
