"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { DailyRecords, NutritionFood, RoutineBackupData, UserProfile } from "../../types/routine";
import { createBrowserSupabaseClient } from "../../lib/supabase/client";
import { getSupabaseEnvStatus } from "../../lib/supabase/isSupabaseConfigured";
import { AuthStatusPanel } from "./AuthStatusPanel";
import { SupabaseSyncPanel } from "./SupabaseSyncPanel";

type AccountMenuProps = {
  records: DailyRecords;
  customFoods: readonly NutritionFood[];
  profile: UserProfile;
  favoriteFoodIds: readonly string[];
  onApplyBackup: (backup: RoutineBackupData) => void;
};

function getAccountLabel(session: Session | null, isConfigured: boolean) {
  if (!isConfigured) {
    return "로컬 모드";
  }

  if (!session) {
    return "로그인";
  }

  const emailPrefix = session.user.email?.split("@")[0]?.trim();
  return emailPrefix || "계정";
}

export function AccountMenu({
  records,
  customFoods,
  profile,
  favoriteFoodIds,
  onApplyBackup,
}: AccountMenuProps) {
  const envStatus = getSupabaseEnvStatus();
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!envStatus.isConfigured) {
      return;
    }

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      return;
    }

    let isActive = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isActive) {
        setSession(data.session);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [envStatus.isConfigured]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative z-30 flex justify-end">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="score-pill inline-flex max-w-[12rem] items-center justify-center rounded-full px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-900"
      >
        <span className="truncate">{getAccountLabel(session, envStatus.isConfigured)}</span>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="계정 메뉴 닫기"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-950/10 backdrop-blur-[1px]"
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-label="계정과 Supabase 백업 관리"
            className="glass-panel absolute inset-x-3 top-3 max-h-[calc(100vh-1.5rem)] overflow-y-auto rounded-[28px] p-4 shadow-[0_32px_90px_-40px_rgba(15,23,42,0.45)] sm:inset-x-auto sm:right-6 sm:top-6 sm:w-[min(34rem,calc(100vw-3rem))] sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">계정 관리</p>
                <h2 className="mt-1 text-lg font-semibold tracking-[-0.04em] text-slate-950">
                  로그인과 수동 백업
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  기본 저장소: 이 기기 localStorage · Supabase 백업은 수동 실행
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="score-pill rounded-full px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-slate-900"
              >
                닫기
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <AuthStatusPanel compact />
              <SupabaseSyncPanel
                records={records}
                customFoods={customFoods}
                profile={profile}
                favoriteFoodIds={favoriteFoodIds}
                onApplyBackup={onApplyBackup}
                compact
              />
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
