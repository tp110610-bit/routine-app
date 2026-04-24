import type { DetailSectionId } from "../../routineData";

type MobileBottomNavTarget = DetailSectionId | "report";

const mobileNavItems: Array<{ id: MobileBottomNavTarget; label: string }> = [
  { id: "nutrition", label: "식단" },
  { id: "training", label: "훈련" },
  { id: "faith", label: "신앙" },
  { id: "hobby", label: "취미" },
  { id: "report", label: "리포트" },
];

export function MobileBottomNav({
  activeDetail,
  onSelect,
}: {
  activeDetail: DetailSectionId;
  onSelect: (target: MobileBottomNavTarget) => void;
}) {
  return (
    <nav
      aria-label="빠른 이동"
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:hidden"
    >
      <div className="mx-auto grid max-w-[420px] grid-cols-5 gap-1 rounded-[24px] border border-slate-200/80 bg-white/92 p-1.5 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.36)] backdrop-blur">
        {mobileNavItems.map((item) => {
          const isActive = item.id !== "report" && activeDetail === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`min-h-11 rounded-[18px] px-2 text-[12px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 active:scale-[0.98] ${
                isActive
                  ? "bg-slate-900 text-white shadow-[0_10px_24px_-18px_rgba(15,23,42,0.42)]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
