import { MetricCard } from "./Primitives";

export function DashboardHero({
  totalScore,
  baseScore,
  totalPossibleScore,
  completedCount,
  totalRoutineItems,
  extraScore,
  overallStatus,
  selectedDate,
  selectedDateLabel,
  selectedDateDetail,
  onSelectedDateChange,
  onResetCurrentDate,
  heightCm,
  weightInput,
  onWeightChange,
  onWeightBlur,
  proteinIntake,
  recommendedProtein,
  proteinRatio,
  priorityTitle,
  priorityDetail,
}: {
  totalScore: number;
  baseScore: number;
  totalPossibleScore: number;
  completedCount: number;
  totalRoutineItems: number;
  extraScore: number;
  overallStatus: string;
  selectedDate: string;
  selectedDateLabel: string;
  selectedDateDetail: string;
  onSelectedDateChange: (value: string) => void;
  onResetCurrentDate: () => void;
  heightCm: number;
  weightInput: string;
  onWeightChange: (value: string) => void;
  onWeightBlur: () => void;
  proteinIntake: number;
  recommendedProtein: number;
  proteinRatio: number;
  priorityTitle: string;
  priorityDetail: string;
}) {
  return (
    <section className="glass-panel rounded-[34px] p-5 sm:p-6">
      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="hero-panel rounded-[32px] p-5 sm:p-6 xl:min-h-[320px] xl:flex-[1.08]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Today</p>
              <h1 className="mt-3 text-[clamp(3.75rem,9vw,6.5rem)] font-semibold leading-none tracking-[-0.09em] text-slate-950">
                {totalScore}
              </h1>
              <p className="mt-4 text-sm font-medium text-slate-500">오늘 총점</p>
            </div>

            <div className="grid gap-2 sm:min-w-[220px]">
              <label className="score-pill rounded-[20px] px-4 py-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">선택 날짜</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => onSelectedDateChange(event.target.value)}
                  className="mt-1.5 w-full bg-transparent text-sm font-medium text-slate-800 outline-none"
                  aria-label="루틴을 확인할 날짜 선택"
                />
              </label>
              <button
                type="button"
                onClick={onResetCurrentDate}
                className="score-pill rounded-[20px] px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                오늘 기록 초기화
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <MetricCard
              label="기본 점수"
              value={`${baseScore} / ${totalPossibleScore}`}
              detail={`${completedCount} / ${totalRoutineItems} 완료`}
              strong
            />
            <MetricCard label="Extra 점수" value={`+${extraScore}`} detail={overallStatus} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[360px] xl:flex-1 xl:grid-cols-1">
          <MetricCard label="선택 날짜" value={selectedDateLabel} detail={selectedDateDetail} />
          <div className="rounded-[24px] border border-slate-200/80 bg-white/88 px-4 py-4 sm:px-5 shadow-[0_14px_28px_-28px_rgba(15,23,42,0.12)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">프로필</p>
            <div className="mt-3 flex items-center justify-between gap-4">
              <span className="text-sm text-slate-500">키 {heightCm}cm</span>
              <label className="flex items-center gap-2 text-sm text-slate-500">
                체중
                <input
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="0.1"
                  value={weightInput}
                  onChange={(event) => onWeightChange(event.target.value)}
                  onBlur={onWeightBlur}
                  className="w-16 bg-transparent text-right font-medium text-slate-900 outline-none"
                  aria-label="몸무게 입력"
                />
                kg
              </label>
            </div>
          </div>
          <div className="rounded-[24px] border border-slate-200/80 bg-white/88 px-4 py-4 sm:px-5 shadow-[0_14px_28px_-28px_rgba(15,23,42,0.12)]">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">단백질</p>
                <p className="mt-3 text-[1.55rem] font-semibold tracking-[-0.04em] text-slate-950">{proteinIntake}g</p>
              </div>
              <p className="text-sm text-slate-500">권장 {recommendedProtein}g</p>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200/80">
              <div className="h-full rounded-full bg-slate-900" style={{ width: `${proteinRatio * 100}%` }} />
            </div>
          </div>
          <MetricCard label="오늘 우선순위" value={priorityTitle} detail={priorityDetail} />
        </div>
      </div>
    </section>
  );
}
