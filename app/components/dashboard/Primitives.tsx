import { ReactNode } from "react";
import { SectionSummaryItem } from "../../routineData";
import { ArchiveSummary, CardTheme, InlineNotice } from "../../lib/dashboard-config";
import { formatArchiveDate, getSummaryToneTextClass } from "../../lib/dashboard-helpers";

export type WeeklyAverageCardData = {
  label: string;
  value: string;
  detail: string;
  placeholder?: boolean;
};

export type WeeklyInsightChipData = {
  label: string;
  value: string;
  detail?: string;
  tone?: "default" | "caution";
  placeholder?: boolean;
};

function SkeletonLine({ className }: { className: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-full bg-slate-200/80 ${className}`} />;
}

export function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
      <path
        d="M3.5 8.5L6.5 11.5L12.5 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StarIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" fill={filled ? "currentColor" : "none"} className="h-3.5 w-3.5">
      <path
        d="M8 2.2L9.7 5.65L13.5 6.2L10.75 8.88L11.4 12.65L8 10.86L4.6 12.65L5.25 8.88L2.5 6.2L6.3 5.65L8 2.2Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SummaryChips({ items }: { items: readonly SectionSummaryItem[] }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={`${item.label}-${item.value}`}
          className="rounded-[16px] border border-slate-200/80 bg-white/92 px-3 py-2.5"
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">{item.label}</p>
          <p className={`mt-1 text-[13px] font-semibold ${getSummaryToneTextClass(item.tone)}`}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export function CompactActionButton({
  label,
  description,
  active = false,
  theme,
  compact = false,
  onClick,
}: {
  label: string;
  description?: string;
  active?: boolean;
  theme: CardTheme;
  compact?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[18px] border text-left transition ${
        active
          ? `${theme.subtle} border-slate-300 text-slate-900`
          : "border-slate-200/90 bg-white/92 text-slate-700 hover:border-slate-300 hover:bg-white"
      } ${compact ? "min-h-[42px] px-3.5 py-2 text-sm font-medium" : "min-h-[44px] px-3.5 py-2.5"}`}
    >
      <p
        className={`${compact ? "text-[13px]" : "text-sm"} font-medium tracking-[-0.01em] ${
          active ? theme.accentText : "text-current"
        }`}
      >
        {label}
      </p>
      {description && !compact ? (
        <p className={`mt-1 text-[11px] leading-4 ${active ? theme.accentText : "text-slate-400"}`}>{description}</p>
      ) : null}
    </button>
  );
}

export function QuickInputGroup({
  title,
  helper,
  children,
}: {
  title: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200/80 bg-white/90 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</p>
        {helper ? <p className="text-[11px] text-slate-400">{helper}</p> : null}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function InlineNoticeMessage({ message }: { message: InlineNotice | null }) {
  if (!message) {
    return null;
  }

  const toneClass =
    message.tone === "success"
      ? "border-slate-200 bg-white/82 text-slate-700"
      : message.tone === "error"
        ? "border-[#d6c1b1] bg-[#fbf7f3] text-[#8b5e3c]"
        : "border-slate-200 bg-white/82 text-slate-600";

  return (
    <p role="status" className={`rounded-[18px] border px-3.5 py-3 text-sm leading-5 ${toneClass}`}>
      {message.text}
    </p>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  strong = false,
  pending = false,
}: {
  label: string;
  value: string;
  detail?: string;
  strong?: boolean;
  pending?: boolean;
}) {
  return (
    <div
      className={`min-h-[112px] rounded-[24px] border px-4 py-4 sm:px-5 ${
        strong
          ? "border-slate-200 bg-white shadow-[0_18px_36px_-30px_rgba(15,23,42,0.16)]"
          : "border-slate-200/80 bg-white/86 shadow-[0_14px_28px_-28px_rgba(15,23,42,0.12)]"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      {pending ? (
        <div className="mt-3 space-y-2">
          <SkeletonLine className="h-7 w-24" />
          <SkeletonLine className="h-3 w-32" />
        </div>
      ) : (
        <>
          <p className="mt-2 text-[1.22rem] font-semibold tracking-[-0.04em] text-slate-950">{value}</p>
          {detail ? <p className="mt-1 text-[11px] leading-5 text-slate-500">{detail}</p> : null}
        </>
      )}
    </div>
  );
}

export function WeeklyAverageCard({
  label,
  value,
  detail,
  pending = false,
  placeholder = false,
}: {
  label: string;
  value: string;
  detail: string;
  pending?: boolean;
  placeholder?: boolean;
}) {
  return (
    <div className="min-h-[118px] rounded-[22px] border border-slate-200/80 bg-white/90 px-4 py-4 shadow-[0_14px_28px_-28px_rgba(15,23,42,0.12)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      {pending ? (
        <div className="mt-3 space-y-2">
          <SkeletonLine className="h-6 w-20" />
          <SkeletonLine className="h-3 w-24" />
        </div>
      ) : (
        <>
          <p className={`mt-2 text-[1.16rem] font-semibold tracking-[-0.04em] ${placeholder ? "text-slate-400" : "text-slate-950"}`}>
            {value}
          </p>
          <p className={`mt-1 text-[11px] leading-5 ${placeholder ? "text-slate-400" : "text-slate-500"}`}>{detail}</p>
        </>
      )}
    </div>
  );
}

export function WeeklyInsightChip({
  label,
  value,
  detail,
  tone = "default",
  placeholder = false,
  pending = false,
}: WeeklyInsightChipData & { pending?: boolean }) {
  if (pending) {
    return (
      <div className="min-h-[90px] rounded-[20px] border border-slate-200/80 bg-white/88 px-3.5 py-3 shadow-[0_12px_24px_-26px_rgba(15,23,42,0.12)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
        <div className="mt-2.5 space-y-2">
          <SkeletonLine className="h-4 w-16" />
          <SkeletonLine className="h-3 w-20" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-[20px] border px-3.5 py-3 shadow-[0_12px_24px_-26px_rgba(15,23,42,0.12)] ${
        tone === "caution" && !placeholder ? "border-[#dcc9bc] bg-[#fbf7f3]" : "border-slate-200/80 bg-white/88"
      }`}
    >
      <p
        className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${
          tone === "caution" && !placeholder ? "text-[#8b5e3c]" : "text-slate-400"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-1.5 text-sm font-semibold ${
          placeholder ? "text-slate-400" : tone === "caution" ? "text-[#8b5e3c]" : "text-slate-900"
        }`}
      >
        {value}
      </p>
      {detail ? (
        <p
          className={`mt-1 text-[11px] leading-4 ${
            placeholder ? "text-slate-400" : tone === "caution" ? "text-[#9a7153]" : "text-slate-400"
          }`}
        >
          {detail}
        </p>
      ) : null}
    </div>
  );
}

export function EmptyStatePanel({
  message,
  detail,
  compact = false,
}: {
  message: string;
  detail?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-[24px] border border-slate-200/70 bg-white/72 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] ${
        compact ? "px-4 py-3.5" : "px-5 py-5"
      }`}
    >
      <p className="text-sm font-medium text-slate-600">{message}</p>
      {detail ? <p className="mt-1 text-[12px] leading-5 text-slate-400">{detail}</p> : null}
    </div>
  );
}

function ArchiveMetricCell({
  label,
  value,
  subdued = false,
  inverted = false,
}: {
  label: string;
  value: string;
  subdued?: boolean;
  inverted?: boolean;
}) {
  return (
    <div
      className={`rounded-[16px] border px-3 py-2.5 ${
        inverted
          ? "border-white/14 bg-white/8"
          : subdued
            ? "border-slate-200/70 bg-slate-50/70"
            : "border-slate-200/80 bg-white/92"
      }`}
    >
      <p className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${inverted ? "text-white/56" : "text-slate-400"}`}>
        {label}
      </p>
      <p className={`mt-1 text-sm font-semibold ${inverted ? "text-white" : subdued ? "text-slate-700" : "text-slate-900"}`}>
        {value}
      </p>
    </div>
  );
}

export function ArchiveSummaryCard({
  summary,
  isSelected,
  isToday,
  totalRoutineItems,
  onClick,
}: {
  summary: ArchiveSummary;
  isSelected: boolean;
  isToday: boolean;
  totalRoutineItems: number;
  onClick: () => void;
}) {
  const isClickable = summary.hasData;
  const statusLabels = [
    isToday ? "오늘" : null,
    isSelected ? "보고 있음" : null,
    !summary.hasData ? "비어 있음" : null,
  ].filter(Boolean);
  const totalScoreLabel = summary.hasData ? `${summary.totalScore}` : "—";
  const baseScoreLabel = summary.hasData ? `${summary.baseScore}` : "—";
  const extraScoreLabel = summary.hasData ? `+${summary.extraScore}` : "—";
  const proteinLabel = summary.hasData ? `${summary.proteinIntake}g` : "—";
  const completionLabel = summary.hasData ? `${summary.completionCount}/${totalRoutineItems}` : "—";
  const nutritionLabel = summary.hasData ? `${summary.nutritionScore}` : "—";
  const trainingLabel = summary.hasData ? `${summary.trainingScore}` : "—";
  const faithLabel = summary.hasData ? `${summary.faithScore}` : "—";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isClickable}
      className={`flex h-full min-h-[248px] w-full flex-col rounded-[26px] border px-4 py-4 text-left transition sm:px-4.5 ${
        isSelected
          ? "border-slate-400 bg-slate-900/[0.98] text-white shadow-[0_24px_42px_-32px_rgba(15,23,42,0.28)] ring-1 ring-white/12"
          : isClickable
            ? "border-slate-200/90 bg-white/92 shadow-[0_14px_28px_-28px_rgba(15,23,42,0.1)] hover:border-slate-300"
            : "border-slate-200/70 bg-slate-50/72 text-slate-500 shadow-none"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-[13px] font-medium ${isSelected ? "text-white/72" : "text-slate-500"}`}>
            {formatArchiveDate(summary.date)}
          </p>
          <p className="mt-1 text-[1.02rem] font-semibold tracking-[-0.03em]">{summary.date}</p>
        </div>
        {statusLabels.length > 0 ? (
          <div className="flex flex-wrap justify-end gap-1.5">
            {statusLabels.map((label) => (
              <span
                key={label}
                className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                  isSelected
                    ? "border-white/16 bg-white/10 text-white/82"
                    : label === "비어 있음"
                      ? "border-slate-200 bg-slate-50 text-slate-400"
                      : label === "오늘"
                        ? "border-slate-200 bg-white text-slate-700"
                        : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${isSelected ? "text-white/58" : "text-slate-400"}`}>
            총점
          </p>
          <p className={`mt-2 text-[2rem] font-semibold leading-none tracking-[-0.06em] ${summary.hasData ? "" : isSelected ? "text-white/72" : "text-slate-400"}`}>
            {totalScoreLabel}
          </p>
        </div>
        <div className="grid min-w-[128px] grid-cols-2 gap-2">
          <ArchiveMetricCell label="기본" value={baseScoreLabel} subdued={!summary.hasData || !isSelected} inverted={isSelected} />
          <ArchiveMetricCell label="추가" value={extraScoreLabel} subdued={!summary.hasData || !isSelected} inverted={isSelected} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <ArchiveMetricCell label="단백질" value={proteinLabel} subdued={!summary.hasData} inverted={isSelected} />
        <ArchiveMetricCell
          label="완료"
          value={completionLabel}
          subdued={!summary.hasData}
          inverted={isSelected}
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <ArchiveMetricCell label="식단" value={nutritionLabel} subdued={!summary.hasData} inverted={isSelected} />
        <ArchiveMetricCell label="훈련" value={trainingLabel} subdued={!summary.hasData} inverted={isSelected} />
        <ArchiveMetricCell label="신앙" value={faithLabel} subdued={!summary.hasData} inverted={isSelected} />
      </div>
    </button>
  );
}

export function ArchivePlaceholderCard() {
  return (
    <div className="flex min-h-[248px] w-full flex-col rounded-[26px] border border-slate-200/80 bg-white/76 px-4 py-4 shadow-[0_14px_28px_-28px_rgba(15,23,42,0.08)] sm:px-4.5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <SkeletonLine className="h-4 w-20" />
          <SkeletonLine className="h-5 w-28" />
        </div>
        <SkeletonLine className="h-6 w-14" />
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div className="space-y-2">
          <SkeletonLine className="h-3 w-10" />
          <SkeletonLine className="h-9 w-16" />
        </div>
        <div className="grid min-w-[128px] grid-cols-2 gap-2">
          <SkeletonLine className="h-[50px] w-full" />
          <SkeletonLine className="h-[50px] w-full" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <SkeletonLine className="h-[50px] w-full" />
        <SkeletonLine className="h-[50px] w-full" />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <SkeletonLine className="h-[50px] w-full" />
        <SkeletonLine className="h-[50px] w-full" />
        <SkeletonLine className="h-[50px] w-full" />
      </div>
    </div>
  );
}

export function SummaryCard({
  title,
  score,
  scoreSuffix,
  progress,
  status,
  active,
  theme,
  onClick,
}: {
  title: string;
  score: number;
  scoreSuffix: string;
  progress: number;
  status: string;
  active: boolean;
  theme: CardTheme;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex h-full min-h-[144px] w-full flex-col rounded-[26px] border p-4.5 text-left transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_32px_-28px_rgba(15,23,42,0.14)] sm:p-5 ${
        theme.card
      } ${
        active
          ? `ring-1 ${theme.activeRing} shadow-[0_20px_34px_-30px_rgba(15,23,42,0.16)]`
          : "shadow-[0_14px_24px_-26px_rgba(15,23,42,0.1)]"
      }`}
    >
      <span
        className={`absolute left-5 top-0 h-1 w-12 -translate-y-px rounded-full ${theme.progress} transition-opacity duration-200 ${
          active ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[0.98rem] font-semibold tracking-[-0.03em] text-slate-950">{title}</p>
          <p className="mt-1.5 min-h-[2.25rem] text-[13px] leading-5 text-slate-500">{status}</p>
        </div>
        <div className="score-pill min-w-[90px] shrink-0 rounded-[20px] px-3 py-2.5 text-right tabular-nums">
          <p className="inline-flex items-baseline whitespace-nowrap text-[1.72rem] font-semibold leading-none tracking-[-0.06em] text-slate-950">
            <span>{score}</span>
            <span className="ml-1 whitespace-nowrap text-xs font-medium tracking-normal text-slate-400">
              {scoreSuffix}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200/80">
            <div className={`h-full rounded-full ${theme.progress}`} style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-slate-400">{Math.round(progress)}%</span>
        </div>
      </div>
    </button>
  );
}
