import { EmptyStatePanel, WeeklyAverageCard, WeeklyAverageCardData, WeeklyInsightChip, WeeklyInsightChipData } from "./Primitives";

export function WeeklySummarySection({
  rangeLabel,
  cards,
  insightChips,
  pending,
  loggedDays,
  isOpen,
  onToggleOpen,
}: {
  rangeLabel: string;
  cards: readonly WeeklyAverageCardData[];
  insightChips: readonly WeeklyInsightChipData[];
  pending: boolean;
  loggedDays: number;
  isOpen: boolean;
  onToggleOpen: () => void;
}) {
  return (
    <section className="glass-panel rounded-[32px] p-5 sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">주간 리포트</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-2xl">최근 7일 리포트</h2>
        </div>
        <button
          type="button"
          onClick={onToggleOpen}
          aria-expanded={isOpen}
          className="score-pill inline-flex items-center justify-center rounded-full px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          {isOpen ? "최근 7일 접기" : "최근 7일 보기"}
        </button>
      </div>

      <div
        className={`grid transition-[grid-template-rows,opacity,margin] duration-200 ease-out ${
          isOpen ? "mt-5 grid-rows-[1fr] opacity-100" : "mt-3 grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          {pending ? (
            <div aria-hidden="true" className="mb-3 h-[38px] w-[180px] animate-pulse rounded-full bg-white/78" />
          ) : (
            <div className="score-pill mb-3 inline-flex rounded-full px-3.5 py-2 text-sm text-slate-500">
              선택 날짜 포함 {rangeLabel}
            </div>
          )}

          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
              {cards.map((metric) => (
                <WeeklyAverageCard
                  key={metric.label}
                  label={metric.label}
                  value={metric.value}
                  detail={metric.detail}
                  pending={pending}
                  placeholder={metric.placeholder}
                />
              ))}
            </div>

            <div className="rounded-[26px] border border-slate-200/80 bg-white/86 px-4 py-4 shadow-[0_16px_30px_-28px_rgba(15,23,42,0.14)] sm:px-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">흐름 요약</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">짧게 보는 최근 흐름</p>
                </div>
                {pending ? (
                  <div aria-hidden="true" className="h-3 w-14 animate-pulse rounded-full bg-slate-200/80" />
                ) : (
                  <p className="text-xs text-slate-400">최근 7일 기준</p>
                )}
              </div>

              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {insightChips.map((chip) => (
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

          {!pending && loggedDays < 3 ? (
            <div className="mt-4">
              <EmptyStatePanel message="최근 흐름은 기록이 쌓이면 더 선명해집니다." compact />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
