import { RoutineState, getHobbyFeedback, hobbySection } from "../../routineData";
import { hobbyStyles } from "../../lib/dashboard-config";
import { getDetailReasonItems } from "../../lib/dashboard-derived";
import { CheckIcon, SummaryChips } from "./Primitives";

export function HobbyCard({
  routine,
  score,
  onToggleActivity,
}: {
  routine: RoutineState;
  score: number;
  onToggleActivity: (key: keyof RoutineState, checked: boolean) => void;
}) {
  const progress = Math.min((score / 8) * 100, 100);
  const summaryItems = getDetailReasonItems("hobby", routine);

  return (
    <article className={`glass-panel rounded-[30px] p-4 sm:p-6 ${hobbyStyles.card}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">취미</p>
          <h2 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.04em] text-slate-950">취미 보너스</h2>
          <p className="mt-1.5 text-sm text-slate-500">추가 몰입 기록</p>
        </div>
        <div className="score-pill inline-flex shrink-0 flex-col rounded-[22px] px-4 py-3 text-left tabular-nums sm:items-end sm:text-right">
          <p className="inline-flex min-w-fit items-baseline whitespace-nowrap text-[2rem] font-semibold leading-none tracking-[-0.06em] text-slate-950">
            {score}
            <span className="ml-1 whitespace-nowrap text-xs font-medium tracking-normal text-slate-400">/ 8</span>
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-slate-400">추가 점수</p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200/80">
          <div className={`h-full rounded-full ${hobbyStyles.progress}`} style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs text-slate-400">최대 8점</span>
      </div>

      <div className="mt-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">점수 근거</p>
        <SummaryChips items={summaryItems} />
      </div>

      <div className="mt-6 rounded-[24px] border border-slate-200/80 bg-white/78 px-2 pt-2 sm:px-3">
        {hobbySection.items.map((item, index) => {
          const previousGroup = index > 0 ? hobbySection.items[index - 1]?.group : null;
          const shouldRenderGroup = item.group !== previousGroup;
          const checked = Boolean(routine[item.key]);

          return (
            <div key={item.key}>
              {shouldRenderGroup ? (
                <p className="pt-3 text-xs font-semibold tracking-[0.12em] text-slate-500">{item.group}</p>
              ) : null}

              <label className="flex cursor-pointer items-center gap-3 py-2.5 transition hover:opacity-90">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => onToggleActivity(item.key, event.target.checked)}
                  className="peer sr-only"
                />
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-white transition ${hobbyStyles.checkbox}`}
                >
                  <span className={checked ? "opacity-100" : "opacity-0"}>
                    <CheckIcon />
                  </span>
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium text-slate-800">
                  {item.label}
                  <span className="ml-1 font-normal text-slate-500">({item.note})</span>
                </span>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${hobbyStyles.subtle} ${hobbyStyles.accentText}`}>
                  +{item.points}
                </span>
              </label>
            </div>
          );
        })}
      </div>

      <div className="soft-panel mt-5 rounded-[22px] px-4 py-3">
        <p
          className="text-sm leading-6 text-slate-600"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {getHobbyFeedback(routine)}
        </p>
      </div>
    </article>
  );
}
