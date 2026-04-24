import {
  ArchiveSummaryCard,
  ArchivePlaceholderCard,
  EmptyStatePanel,
  WeeklyAverageCard,
  WeeklyAverageCardData,
  WeeklyInsightChip,
  WeeklyInsightChipData,
} from "./Primitives";
import { ArchiveSummary } from "../../lib/dashboard-config";

export function HistorySection({
  summaries,
  retrospectiveCards,
  retrospectiveChips,
  pending,
  selectedDate,
  todayDate,
  totalRoutineItems,
  rangeLabel,
  loggedDays,
  onSelectDate,
}: {
  summaries: readonly ArchiveSummary[];
  retrospectiveCards: readonly WeeklyAverageCardData[];
  retrospectiveChips: readonly WeeklyInsightChipData[];
  pending: boolean;
  selectedDate: string;
  todayDate: string;
  totalRoutineItems: number;
  rangeLabel: string;
  loggedDays: number;
  onSelectDate: (date: string) => void;
}) {
  return (
    <section className="glass-panel rounded-[32px] p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">기록 아카이브</p>
          <h2 className="text-xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-2xl">기록 보기</h2>
          <p className="mt-1 text-sm text-slate-400">최신순 아카이브와 짧은 회고</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
          <span className="score-pill rounded-full px-3 py-1.5">최신순</span>
          <span>기록 {summaries.length}개</span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {retrospectiveCards.map((card) => (
            <WeeklyAverageCard
              key={card.label}
              label={card.label}
              value={card.value}
              detail={card.detail}
              pending={pending}
              placeholder={card.placeholder}
            />
          ))}
        </div>

        <div className="rounded-[26px] border border-slate-200/80 bg-white/88 px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">회고</p>
              <p className="mt-1 text-sm font-medium text-slate-900">최근 흐름 한눈에 보기</p>
            </div>
            {pending ? (
              <div aria-hidden="true" className="h-3 w-20 animate-pulse rounded-full bg-slate-200/80" />
            ) : (
              <p className="text-xs text-slate-400">{rangeLabel}</p>
            )}
          </div>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
            {retrospectiveChips.map((chip) => (
              <WeeklyInsightChip
                key={chip.label}
                label={chip.label}
                value={chip.value}
                detail={chip.detail}
                tone={chip.tone}
                placeholder={chip.placeholder}
                pending={pending}
              />
            ))}
          </div>
        </div>
      </div>

      {!pending && loggedDays < 2 ? (
        <div className="mt-4">
          <EmptyStatePanel message="회고는 며칠 더 쌓이면 더 또렷해집니다." compact />
        </div>
      ) : null}

      {summaries.length === 0 ? (
        <div className="mt-5 space-y-3">
          <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <ArchivePlaceholderCard key={`archive-placeholder-${index}`} />
            ))}
          </div>
          {!pending ? <EmptyStatePanel message="첫 기록이 쌓이면 이곳에 차분히 정리됩니다." compact /> : null}
        </div>
      ) : (
        <div className="mt-5 grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
          {summaries.map((summary) => (
            <ArchiveSummaryCard
              key={summary.date}
              summary={summary}
              isSelected={summary.date === selectedDate}
              isToday={summary.date === todayDate}
              totalRoutineItems={totalRoutineItems}
              onClick={() => onSelectDate(summary.date)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
