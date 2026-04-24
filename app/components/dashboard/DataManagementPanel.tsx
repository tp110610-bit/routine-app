import { ChangeEvent, RefObject } from "react";
import { InlineNotice } from "../../lib/dashboard-config";
import { EmptyStatePanel, InlineNoticeMessage } from "./Primitives";

export function DataManagementPanel({
  recordCount,
  customFoodCount,
  favoriteFoodCount,
  message,
  importFileInputRef,
  onExport,
  onOpenImport,
  onImportChange,
  onReset,
}: {
  recordCount: number;
  customFoodCount: number;
  favoriteFoodCount: number;
  message: InlineNotice | null;
  importFileInputRef: RefObject<HTMLInputElement | null>;
  onExport: () => void;
  onOpenImport: () => void;
  onImportChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
}) {
  const isMostlyEmpty = recordCount === 0 && customFoodCount === 0 && favoriteFoodCount === 0;

  return (
    <section className="glass-panel rounded-[32px] p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">데이터</p>
          <h2 className="text-xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-2xl">데이터 관리</h2>
          <p className="mt-1 text-sm text-slate-400">
            날짜별 루틴 기록, 프로필, 커스텀 음식, 즐겨찾기를 한 번에 백업하거나 복원해요.
          </p>
        </div>
        <p className="text-sm text-slate-400">기록 {recordCount}일 · 커스텀 음식 {customFoodCount}개</p>
      </div>

      <div className="soft-panel mt-5 rounded-[24px] px-4 py-4 sm:px-5">
        <p className="text-sm leading-6 text-slate-600">
          잘못된 JSON 파일은 적용하지 않고, 복원 전에는 한 번 더 확인해서 기존 데이터를 보호합니다.
        </p>
        {isMostlyEmpty ? (
          <div className="mt-4">
            <EmptyStatePanel
              message="백업할 데이터가 많지 않습니다"
              detail="현재 상태 그대로 내보낼 수 있습니다."
              compact
            />
          </div>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onExport}
            className="score-pill rounded-full px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            데이터 내보내기
          </button>
          <button
            type="button"
            onClick={onOpenImport}
            className="score-pill rounded-full px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            데이터 불러오기
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-full border border-[#d6c1b1] bg-white px-3.5 py-2 text-sm font-medium text-[#8b5e3c] transition hover:bg-[#fbf7f3]"
          >
            전체 초기화
          </button>
        </div>
        <div className="mt-4">
          <InlineNoticeMessage message={message} />
        </div>
        <input
          ref={importFileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={onImportChange}
          className="sr-only"
        />
      </div>
    </section>
  );
}
