# 内容监控原型 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js page at `/monitoring` that renders the内容监控工具原型（分类管理 + Tab1 内容 + Tab2 选题分析 + Tab3 监控设置）并填充假数据。

**Architecture:** Use mock data + lightweight local state hook for UI state, composed into modular React components (`LayoutShell`, `ContentTab`, `ReportsTab`, `SettingsTab`). Tailwind utility classes in `globals.css` provide layout + responsiveness.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, TailwindCSS v4, local mock data modules.

---

### Task 1: 定义类型、假数据与状态 Hook

**Files:**
- Create: `lib/monitoring/types.ts`
- Create: `lib/monitoring/mockData.ts`
- Create: `lib/monitoring/useMonitoringState.ts`

- [ ] **Step 1: Add shared类型定义**

```ts
// lib/monitoring/types.ts
export type Platform = "抖音" | "小红书" | "微博" | "B站" | "快手";

export interface MonitoringCategory {
  id: string;
  name: string;
  group?: string;
  unreadInsights: number;
  lastRunAt: string;
  status: "success" | "warning" | "failed";
}

export interface ContentItem {
  id: string;
  title: string;
  thumbnail: string;
  platform: Platform;
  tag: string;
  account: string;
  metrics: { likes: number; comments: number; shares: number; heat: number };
  collectedAt: string;
  bookmarked: boolean;
  flagged: boolean;
}

export interface DailyContentGroup {
  date: string;
  summary: { total: number; highlighted: number };
  items: ContentItem[];
}

export interface ReportInsight {
  id: string;
  title: string;
  description: string;
  why: string;
  hotspot: string;
  growthSpace: string;
  score: number;
  sourceCount: number;
  tags: string[];
}

export interface DailyReport {
  date: string;
  summary: string;
  topHighlights: string[];
  insights: ReportInsight[];
}

export interface MonitoringTarget {
  id: string;
  label: string;
  type: "keyword" | "creator";
  platforms: Platform[];
  status: "active" | "paused";
  frequency: "hourly" | "daily" | "weekly";
  aiDepth: "lite" | "standard" | "deep";
  lastCapturedAt: string;
  notes?: string;
}
```

- [ ] **Step 2: 填充假数据**

```ts
// lib/monitoring/mockData.ts
import { ContentItem, DailyContentGroup, DailyReport, MonitoringCategory, MonitoringTarget, Platform } from "./types";

export const platforms: Platform[] = ["抖音", "小红书", "微博", "B站", "快手"];

export const categories: MonitoringCategory[] = [
  { id: "claude", name: "claudecode 选题监控", group: "AI 创作者", unreadInsights: 3, lastRunAt: "2026-03-31T23:20:00+08:00", status: "success" },
  { id: "vibe", name: "Vibecoding 选题监控", group: "AI 创作者", unreadInsights: 1, lastRunAt: "2026-03-31T23:15:00+08:00", status: "warning" },
  { id: "commerce", name: "直播带货矩阵", group: "电商", unreadInsights: 0, lastRunAt: "2026-03-31T22:50:00+08:00", status: "success" }
];

const sampleContent = (platform: Platform, idx: number): ContentItem => ({
  id: `${platform}-${idx}`,
  title: `${platform} 热门内容 ${idx}`,
  thumbnail: `https://picsum.photos/seed/${platform}-${idx}/400/240`,
  platform,
  tag: idx % 2 ? "#AI剪辑" : "#选题灵感",
  account: idx % 2 ? "@claudecode" : "@VibecodingLab",
  metrics: { likes: 1200 * idx, comments: 240 * idx, shares: 80 * idx, heat: 60 + idx * 5 },
  collectedAt: `2026-03-${20 + idx}T1${idx}:00:00+08:00`,
  bookmarked: idx % 3 === 0,
  flagged: idx % 4 === 0
});

export const contentTimeline: DailyContentGroup[] = Array.from({ length: 5 }).map((_, dayIdx) => ({
  date: `2026-03-${27 + dayIdx}`,
  summary: { total: 24 + dayIdx * 3, highlighted: 4 + dayIdx },
  items: platforms.map((platform, pIdx) => sampleContent(platform, dayIdx + pIdx + 1))
}));

export const dailyReports: DailyReport[] = contentTimeline.map((day, idx) => ({
  date: day.date,
  summary: `当天共采集 ${day.summary.total} 条内容，AI 识别 ${day.summary.highlighted} 条潜力话题。`,
  topHighlights: [
    `热点 ${idx + 1}: AI 原生剪辑模板 24 小时破 10W 播`,
    `热点 ${idx + 2}: Vibecoding 发布开源 Prompt 套件`
  ],
  insights: day.items.map((item, insightIdx) => ({
    id: `${item.id}-insight`,
    title: `方向 ${insightIdx + 1} · ${item.tag}`,
    description: `${item.platform} 内容热度 ${item.metrics.heat}，互动呈指数增长。`,
    why: "用户追捧可直接复用的模板，提高制作效率。",
    hotspot: `指数峰值 ${item.metrics.likes.toLocaleString()} 赞。`,
    growthSpace: "可延伸为跨平台联合评测或品牌共创。",
    score: 70 + insightIdx * 3,
    sourceCount: insightIdx + 2,
    tags: insightIdx % 2 ? ["热点", "破圈"] : ["长尾", "竞品"]
  }))
}));

export const monitoringTargets: MonitoringTarget[] = [
  { id: "keyword-ai", label: "#AI剪辑", type: "keyword", platforms: ["抖音", "小红书", "快手"], status: "active", frequency: "daily", aiDepth: "standard", lastCapturedAt: "2026-03-31T23:00:00+08:00", notes: "重点关注24小时爆文" },
  { id: "keyword-topic", label: "#选题灵感", type: "keyword", platforms: ["小红书", "微博"], status: "active", frequency: "daily", aiDepth: "lite", lastCapturedAt: "2026-03-31T22:30:00+08:00" },
  { id: "creator-claude", label: "@claudecode", type: "creator", platforms: ["抖音", "B站"], status: "paused", frequency: "weekly", aiDepth: "deep", lastCapturedAt: "2026-03-28T20:20:00+08:00", notes: "暂停中，待新 campaign" }
];
```

- [ ] **Step 3: 状态 hook**

```ts
// lib/monitoring/useMonitoringState.ts
"use client";
import { useMemo, useState } from "react";
import { categories, contentTimeline, dailyReports, monitoringTargets, platforms } from "./mockData";
import { DailyContentGroup, DailyReport, MonitoringCategory, MonitoringTarget, Platform } from "./types";

export function useMonitoringState() {
  const [selectedCategory, setSelectedCategory] = useState<MonitoringCategory>(categories[0]);
  const [activeTab, setActiveTab] = useState<"content" | "report" | "settings">("content");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(platforms);
  const [selectedDate, setSelectedDate] = useState(contentTimeline[0].date);
  const [reportFilters, setReportFilters] = useState<string[]>([]);
  const [reportKeywords, setReportKeywords] = useState<string[]>([]);

  const dailyContent = useMemo<DailyContentGroup[]>(() => contentTimeline, []);
  const reports = useMemo<DailyReport[]>(() => dailyReports, []);
  const targets = useMemo<MonitoringTarget[]>(() => monitoringTargets, []);

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const toggleReportFilter = (tag: string) => {
    setReportFilters((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const addReportKeyword = (kw: string) => {
    if (!kw.trim()) return;
    setReportKeywords((prev) => (prev.includes(kw) ? prev : [...prev, kw]));
  };

  const removeReportKeyword = (kw: string) => {
    setReportKeywords((prev) => prev.filter((tag) => tag !== kw));
  };

  return {
    categories,
    dailyContent,
    reports,
    targets,
    platforms,
    state: {
      selectedCategory,
      activeTab,
      selectedPlatforms,
      selectedDate,
      reportFilters,
      reportKeywords
    },
    actions: {
      setSelectedCategory,
      setActiveTab,
      setSelectedPlatforms: setSelectedPlatforms,
      setSelectedDate,
      togglePlatform,
      toggleReportFilter,
      addReportKeyword,
      removeReportKeyword
    }
  };
}
```

- [ ] **Step 4: 运行 lint** — `npm run lint`

### Task 2: LayoutShell 与分类导航

**Files:**
- Create: `components/monitoring/LayoutShell.tsx`

- [ ] **Step 1: 构建 LayoutShell**

```tsx
// components/monitoring/LayoutShell.tsx
"use client";
import clsx from "clsx";
import { ReactNode } from "react";
import { MonitoringCategory } from "@/lib/monitoring/types";

interface LayoutShellProps {
  categories: MonitoringCategory[];
  activeCategoryId: string;
  onSelectCategory: (category: MonitoringCategory) => void;
  onCreateCategory: () => void;
  children: ReactNode;
}

export function LayoutShell({ categories, activeCategoryId, onSelectCategory, onCreateCategory, children }: LayoutShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="hidden w-72 flex-shrink-0 flex-col border-r border-white/5 bg-slate-950/80 p-4 lg:flex">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">监控分类</p>
            <p className="text-lg font-semibold">Content Radar</p>
          </div>
          <button onClick={onCreateCategory} className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/90 hover:border-white/40">新建</button>
        </div>
        <div className="space-y-2 overflow-y-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category)}
              className={clsx(
                "w-full rounded-2xl border px-4 py-3 text-left transition",
                activeCategoryId === category.id ? "border-cyan-400/60 bg-cyan-400/10" : "border-white/5 hover:border-white/20"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{category.name}</span>
                {category.unreadInsights > 0 && (
                  <span className="rounded-full bg-cyan-400/20 px-2 text-xs text-cyan-300">+{category.unreadInsights}</span>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                <span>{category.group ?? "未分组"}</span>
                <span
                  className={clsx({
                    "text-green-300": category.status === "success",
                    "text-amber-300": category.status === "warning",
                    "text-rose-300": category.status === "failed"
                  })}
                >
                  {new Date(category.lastRunAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </button>
          ))}
        </div>
      </aside>
      <main className="flex-1">
        <div className="border-b border-white/5 bg-slate-900/60 px-6 py-4 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">当前分类</p>
              <p className="text-2xl font-semibold">{categories.find((c) => c.id === activeCategoryId)?.name}</p>
            </div>
            <div className="flex flex-1 items-center justify-end gap-3 text-xs text-slate-300">
              <div className="rounded-full border border-white/10 px-3 py-1">最近运行 · 03:30</div>
              <button className="rounded-full bg-cyan-400/80 px-4 py-1 text-slate-900">立即运行</button>
            </div>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: lint** — `npm run lint`

### Task 3: Tab1 内容视图

**Files:**
- Create: `components/monitoring/ContentTab.tsx`

- [ ] **Step 1: 概览与平台筛选组件**

```tsx
// components/monitoring/ContentTab.tsx
import { DailyContentGroup, Platform } from "@/lib/monitoring/types";

interface ContentTabProps {
  platforms: Platform[];
  selectedPlatforms: Platform[];
  onTogglePlatform: (platform: Platform) => void;
  timeline: DailyContentGroup[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function ContentTab({ platforms, selectedPlatforms, onTogglePlatform, timeline, selectedDate, onSelectDate }: ContentTabProps) {
  const selectedGroup = timeline.find((group) => group.date === selectedDate) ?? timeline[0];
  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl border border-white/5 bg-white/5 p-4">
          <p className="text-xs text-slate-400">今日亮点</p>
          <h3 className="text-2xl font-semibold">{selectedGroup.summary.total} 条内容</h3>
          <p className="text-sm text-slate-400">AI 推荐 {selectedGroup.summary.highlighted} 条可转化选题</p>
          <button className="mt-4 rounded-full border border-white/10 px-4 py-2 text-sm text-cyan-200">查看最新报告 →</button>
        </article>
        <article className="rounded-3xl border border-white/5 bg-white/5 p-4">
          <p className="text-xs text-slate-400">平台热度</p>
          <div className="mt-4 grid grid-cols-5 gap-2 text-center text-xs text-slate-300">
            {platforms.map((platform) => (
              <div key={platform} className="rounded-2xl border border-white/5 p-3">
                <p className="text-sm font-semibold">{platform}</p>
                <p className="text-lg font-black text-cyan-300">{Math.floor(Math.random() * 40) + 10}%</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {platforms.map((platform) => (
            <button
              key={platform}
              onClick={() => onTogglePlatform(platform)}
              className={`rounded-full px-4 py-1 text-sm transition ${
                selectedPlatforms.includes(platform) ? "bg-cyan-400/90 text-slate-950" : "bg-white/5 text-slate-200 hover:bg-white/10"
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <div className="flex gap-3">
            {timeline.map((group) => (
              <button
                key={group.date}
                onClick={() => onSelectDate(group.date)}
                className={`min-w-[140px] rounded-2xl border px-4 py-3 text-left ${
                  group.date === selectedDate ? "border-cyan-400/60 bg-cyan-400/10" : "border-white/5"
                }`}
              >
                <p className="text-xs text-slate-400">{group.date}</p>
                <p className="text-lg font-semibold">{group.summary.total} 条</p>
                <p className="text-xs text-cyan-200">热度 {group.summary.highlighted}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {selectedGroup.items
          .filter((item) => selectedPlatforms.includes(item.platform))
          .map((item) => (
            <article key={item.id} className="flex flex-col gap-4 rounded-3xl border border-white/5 bg-white/5 p-4 md:flex-row">
              <img src={item.thumbnail} alt={item.title} className="h-32 w-full rounded-2xl object-cover md:w-52" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-white/10 px-3 py-1">{item.platform}</span>
                  <span className="text-cyan-200">{item.tag}</span>
                  <span className="text-slate-400">{new Date(item.collectedAt).toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit" })}</span>
                </div>
                <h4 className="text-lg font-semibold">{item.title}</h4>
                <p className="text-sm text-slate-400">关联 {item.account}</p>
                <div className="grid grid-cols-4 gap-2 text-sm text-slate-400">
                  <p>👍 {item.metrics.likes.toLocaleString()}</p>
                  <p>💬 {item.metrics.comments.toLocaleString()}</p>
                  <p>🔁 {item.metrics.shares.toLocaleString()}</p>
                  <p>🔥 {item.metrics.heat}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <button className="rounded-full border border-white/10 px-4 py-1 text-cyan-200">收藏</button>
                <button className="rounded-full border border-amber-400/40 px-4 py-1 text-amber-200">标记重点</button>
                <button className="rounded-full border border-white/10 px-4 py-1 text-slate-200">加入选题分析</button>
              </div>
            </article>
          ))}
      </section>
    </div>
  );
}
```

- [ ] **Step 2: lint** — `npm run lint`

### Task 4: Tab2 选题分析

**Files:**
- Create: `components/monitoring/ReportsTab.tsx`

- [ ] **Step 1: 报告组件**

```tsx
// components/monitoring/ReportsTab.tsx
import { DailyReport } from "@/lib/monitoring/types";

const PRESET_FILTERS = ["热点", "破圈", "长尾", "竞品", "趋势"];

interface ReportsTabProps {
  reports: DailyReport[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  filters: string[];
  onToggleFilter: (tag: string) => void;
  keywords: string[];
  onAddKeyword: (kw: string) => void;
  onRemoveKeyword: (kw: string) => void;
}

export function ReportsTab({ reports, selectedDate, onSelectDate, filters, onToggleFilter, keywords, onAddKeyword, onRemoveKeyword }: ReportsTabProps) {
  const latestReport = reports[0];
  const activeReport = reports.find((report) => report.date === selectedDate) ?? latestReport;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/5 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-400">最新报告 · {latestReport.date}</p>
            <h3 className="text-2xl font-semibold">{latestReport.summary}</h3>
          </div>
          <button className="rounded-full bg-cyan-400/90 px-5 py-2 text-slate-950">重新分析</button>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-slate-300">
          {latestReport.topHighlights.map((item) => (
            <li key={item} className="rounded-2xl bg-white/5 px-4 py-2">{item}</li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4 lg:flex-row">
        <aside className="w-full space-y-3 rounded-2xl border border-white/5 bg-white/5 p-4 lg:w-64">
          <p className="text-xs text-slate-400">日期</p>
          <div className="space-y-2 max-h-[360px] overflow-y-auto">
            {reports.map((report) => (
              <button
                key={report.date}
                onClick={() => onSelectDate(report.date)}
                className={`w-full rounded-2xl border px-3 py-2 text-left text-sm ${
                  report.date === selectedDate ? "border-cyan-400/60 bg-cyan-400/10" : "border-white/5"
                }`}
              >
                <p className="text-xs text-slate-400">{report.date}</p>
                <p className="font-semibold">{report.summary.slice(0, 18)}...</p>
              </button>
            ))}
          </div>
        </aside>
        <div className="flex-1 space-y-4">
          <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
            <p className="text-xs text-slate-400">选题维度</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESET_FILTERS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onToggleFilter(tag)}
                  className={`rounded-full px-3 py-1 text-xs ${filters.includes(tag) ? "bg-cyan-400/90 text-slate-950" : "bg-white/10 text-slate-200"}`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {keywords.map((kw) => (
                <span key={kw} className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs">
                  {kw}
                  <button onClick={() => onRemoveKeyword(kw)} aria-label="remove keyword">✕</button>
                </span>
              ))}
              <input
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onAddKeyword(event.currentTarget.value);
                    event.currentTarget.value = "";
                  }
                }}
                placeholder="输入关键词回车筛选"
                className="flex-1 rounded-full border border-dashed border-white/20 bg-transparent px-3 py-1 text-xs text-white focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="space-y-3">
            {activeReport.insights.map((insight) => (
              <article key={insight.id} className="rounded-3xl border border白/5 bg-white/5 p-4">
                <div className="flex flex-wrap items中心 gap-3">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-cyan-200">潜力 {insight.score}</span>
                  <h4 className="text-lg font-semibold">{insight.title}</h4>
                  <span className="text-xs text-slate-400">来源 {insight.sourceCount} 条内容</span>
                </div>
                <p className="mt-2 text-sm text-slate-300">{insight.description}</p>
                <p className="text-xs text-slate-400">为什么：{insight.why}</p>
                <p className="text-xs text-slate-400">爆点：{insight.hotspot}</p>
                <p className="text-xs text-slate-400">增长空间：{insight.growthSpace}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-cyan-200">
                  {insight.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-cyan-400/10 px-3 py-1">{tag}</span>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  <button className="rounded-full border border-white/10 px-4 py-2">生成内容提纲</button>
                  <button className="rounded-full border border白/10 px-4 py-2">加入执行计划</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: lint** — `npm run lint`

### Task 5: Tab3 监控设置

**Files:**
- Create: `components/monitoring/SettingsTab.tsx`

- [ ] **Step 1: 监控矩阵**

```tsx
// components/monitoring/SettingsTab.tsx
import { MonitoringTarget, Platform } from "@/lib/monitoring/types";

interface SettingsTabProps {
  targets: MonitoringTarget[];
  platforms: Platform[];
}

export function SettingsTab({ targets, platforms }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/5 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400">快速模板</p>
            <h3 className="text-lg font-semibold">常用组合一键启用</h3>
          </div>
          <div className="flex gap-2 text-sm">
            <button className="rounded-full border border-white/10 px-4 py-2">抖音热门关键词</button>
            <button className="rounded-full border borderwhite/10 px-4 py-2">小红书品牌对标</button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border borderwhite/5 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-300">监控矩阵（{targets.length} 项）</p>
          <button className="rounded-full bg-cyan-400/90 px-4 py-2 text-slate-900">添加监控项</button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-300">
            <thead>
              <tr>
                <th className="px-3 py-2">对象</th>
                {platforms.map((platform) => (
                  <th key={platform} className="px-3 py-2 text-center">{platform}</th>
                ))}
                <th className="px-3 py-2">频率</th>
                <th className="px-3 py-2">AI 深度</th>
                <th className="px-3 py-2">最近抓取</th>
              </tr>
            </thead>
            <tbody>
              {targets.map((target) => (
                <tr key={target.id} className="border-t border-white/5">
                  <td className="px-3 py-3">
                    <div className="text-sm font-semibold">{target.label}</div>
                    <p className="text-xs text-slate-400">{target.type === "keyword" ? "关键词" : "博主"}</p>
                  </td>
                  {platforms.map((platform) => (
                    <td key={platform} className="px-3 py-3 text-center">
                      <button className={`rounded-full px-3 py-1 text-xs ${target.platforms.includes(platform) ? "bg-cyan-400/80 text-slate-950" : "bg-white/5 text-slate-400"}`}>
                        {target.platforms.includes(platform) ? "启用" : "-"}
                      </button>
                    </td>
                  ))}
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs">{target.frequency}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs">{target.aiDepth}</span>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-400">
                    {new Date(target.lastCapturedAt).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: lint** — `npm run lint`

### Task 6: Page 组装与样式增强

**Files:**
- Create: `app/monitoring/page.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: 监控页面**

```tsx
// app/monitoring/page.tsx
import { ContentTab } from "@/components/monitoring/ContentTab";
import { LayoutShell } from "@/components/monitoring/LayoutShell";
import { ReportsTab } from "@/components/monitoring/ReportsTab";
import { SettingsTab } from "@/components/monitoring/SettingsTab";
import { useMonitoringState } from "@/lib/monitoring/useMonitoringState";

export default function MonitoringPage() {
  const { categories, dailyContent, reports, targets, platforms, state, actions } = useMonitoringState();

  return (
    <LayoutShell
      categories={categories}
      activeCategoryId={state.selectedCategory.id}
      onSelectCategory={actions.setSelectedCategory}
      onCreateCategory={() => alert("暂未实现")}
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-white/5 pb-4">
        <TabButton label="内容" active={state.activeTab === "content"} onClick={() => actions.setActiveTab("content")} />
        <TabButton label="选题分析与报告" active={state.activeTab === "report"} onClick={() => actions.setActiveTab("report")} />
        <TabButton label="监控设置" active={state.activeTab === "settings"} onClick={() => actions.setActiveTab("settings")} />
      </div>
      <section className="mt-6">
        {state.activeTab === "content" && (
          <ContentTab
            platforms={platforms}
            selectedPlatforms={state.selectedPlatforms}
            onTogglePlatform={actions.togglePlatform}
            timeline={dailyContent}
            selectedDate={state.selectedDate}
            onSelectDate={actions.setSelectedDate}
          />
        )}
        {state.activeTab === "report" && (
          <ReportsTab
            reports={reports}
            selectedDate={state.selectedDate}
            onSelectDate={actions.setSelectedDate}
            filters={state.reportFilters}
            onToggleFilter={actions.toggleReportFilter}
            keywords={state.reportKeywords}
            onAddKeyword={actions.addReportKeyword}
            onRemoveKeyword={actions.removeReportKeyword}
          />
        )}
        {state.activeTab === "settings" && <SettingsTab targets={targets} platforms={platforms} />}
      </section>
    </LayoutShell>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-1 text-sm transition ${active ? "bg-white text-slate-900" : "bg-white/5 text-slate-300"}`}
    >
      {label}
    </button>
  );
}
```

- [ ] **Step 2: 全局样式补充**

```css
/* app/globals.css 追加 */
body {
  font-family: "Inter", "PingFang SC", "HarmonyOS Sans", system-ui;
  background-color: #020617;
  color: #e2e8f0;
}

img {
  display: block;
  max-width: 100%;
}

button {
  cursor: pointer;
}
```

- [ ] **Step 3: lint** — `npm run lint`

- [ ] **Step 4: 手动验证** — `npm run dev` then open `http://localhost:3000/monitoring` to ensure tabs、筛选、矩阵渲染正常。

---

## Self-Review Checklist
- Spec coverage confirmed for分类导航、Tab1、Tab2、Tab3 + 假数据。
- Exact file paths + code snippets are present; no placeholders。
- Verification steps include lint + manual UI smoke test。
