"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { DailyRecords, NutritionFood, RoutineBackupData, UserProfile } from "../../types/routine";
import { createBrowserSupabaseClient } from "../../lib/supabase/client";
import { getSupabaseEnvStatus } from "../../lib/supabase/isSupabaseConfigured";
import {
  downloadRoutineBackupFromSupabase,
  uploadRoutineBackupToSupabase,
} from "../../lib/supabase/routineSync";
import type { InlineNotice } from "../../lib/dashboard-config";
import { InlineNoticeMessage } from "./Primitives";

type SupabaseSyncPanelProps = {
  records: DailyRecords;
  customFoods: readonly NutritionFood[];
  profile: UserProfile;
  favoriteFoodIds: readonly string[];
  onApplyBackup: (backup: RoutineBackupData) => void;
  compact?: boolean;
};

function getLocalSummary(
  records: DailyRecords,
  customFoods: readonly NutritionFood[],
  favoriteFoodIds: readonly string[],
) {
  return {
    recordCount: Object.keys(records).length,
    customFoodCount: customFoods.filter((food) => food.isCustom).length,
    favoriteFoodCount: favoriteFoodIds.length,
  };
}

export function SupabaseSyncPanel({
  records,
  customFoods,
  profile,
  favoriteFoodIds,
  onApplyBackup,
  compact = false,
}: SupabaseSyncPanelProps) {
  const envStatus = getSupabaseEnvStatus();
  const [session, setSession] = useState<Session | null>(null);
  const [message, setMessage] = useState<InlineNotice | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    if (!envStatus.isConfigured) {
      return;
    }

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      return;
    }

    let isActive = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isActive) {
        return;
      }

      if (error) {
        setMessage({ tone: "error", text: error.message });
      }

      setSession(data.session);
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

  if (!envStatus.isConfigured || !session) {
    return null;
  }

  const localSummary = getLocalSummary(records, customFoods, favoriteFoodIds);
  const isDisabled = isWorking;

  const handleUpload = async () => {
    const shouldUpload = window.confirm(
      "현재 이 기기의 로컬 루틴 데이터를 Supabase에 백업합니다. 같은 날짜의 Supabase 기록과 같은 food key의 커스텀 음식은 현재 기기의 로컬 값으로 갱신될 수 있습니다. 계속할까요?",
    );

    if (!shouldUpload) {
      setMessage({ tone: "neutral", text: "Supabase 백업을 취소했습니다." });
      return;
    }

    setIsWorking(true);
    setMessage(null);

    const result = await uploadRoutineBackupToSupabase({
      userId: session.user.id,
      records,
      customFoods,
      profile,
      favoriteFoodIds,
    });

    setIsWorking(false);

    if (!result.ok) {
      setMessage({ tone: "error", text: `Supabase 백업 실패: ${result.error}` });
      return;
    }

    setMessage({
      tone: "success",
      text: `Supabase에 백업했습니다. 기록 ${result.uploaded.logs}일, 커스텀 음식 ${result.uploaded.customFoods}개, 프로필과 즐겨찾기를 갱신했습니다.`,
    });
  };

  const handleDownload = async () => {
    setIsWorking(true);
    setMessage(null);

    const result = await downloadRoutineBackupFromSupabase({
      userId: session.user.id,
    });

    setIsWorking(false);

    if (!result.ok) {
      setMessage({ tone: "error", text: `Supabase 불러오기 실패: ${result.error}` });
      return;
    }

    if (result.isEmpty) {
      setMessage({
        tone: "neutral",
        text: "Supabase에 불러올 백업 데이터가 없습니다. 현재 로컬 데이터는 유지됩니다.",
      });
      return;
    }

    const shouldApply = window.confirm(
      `Supabase 백업 데이터를 이 기기에 불러옵니다. 백업은 일부 데이터만 담고 있을 수 있고, 승인하면 현재 localStorage의 루틴 기록, 커스텀 음식, 프로필, 즐겨찾기가 Supabase 데이터로 교체됩니다. 계속할까요?\n\nSupabase 데이터: 기록 ${result.counts.logs}일, 커스텀 음식 ${result.counts.customFoods}개, 즐겨찾기 ${result.counts.favoriteFoodIds}개`,
    );

    if (!shouldApply) {
      setMessage({ tone: "neutral", text: "Supabase 불러오기를 취소했습니다. 현재 로컬 데이터는 유지됩니다." });
      return;
    }

    try {
      onApplyBackup(result.backup);
      setMessage({
        tone: "success",
        text: `Supabase 데이터를 이 기기에 불러왔습니다. 기록 ${result.counts.logs}일, 커스텀 음식 ${result.counts.customFoods}개를 적용했습니다.`,
      });
    } catch (error) {
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Supabase 데이터를 로컬 상태에 적용하지 못했습니다.",
      });
    }
  };

  return (
    <section
      className={
        compact
          ? "rounded-[22px] border border-slate-200/80 bg-white/88 p-3.5"
          : "glass-panel rounded-[28px] p-4 sm:p-5"
      }
    >
      <div className={`flex flex-col gap-4 ${compact ? "" : "lg:flex-row lg:items-end lg:justify-between"}`}>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Supabase Sync</p>
          <h2 className="mt-1 text-lg font-semibold tracking-[-0.04em] text-slate-950">수동 백업/불러오기</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            자동 동기화가 아닙니다. 버튼을 누를 때만 이 기기의 localStorage 데이터와 Supabase 백업 저장소를
            주고받습니다.
          </p>
          <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-400">
            백업은 같은 날짜 기록과 같은 food key를 현재 기기 값으로 갱신할 수 있습니다. 불러오기는 부분 백업일 수
            있으며 승인 시 현재 로컬 기록을 대체할 수 있습니다.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            현재 로컬: 기록 {localSummary.recordCount}일 · 커스텀 음식 {localSummary.customFoodCount}개 · 즐겨찾기{" "}
            {localSummary.favoriteFoodCount}개
          </p>
        </div>

        <div className={`flex gap-2 ${compact ? "flex-col sm:flex-row" : "flex-wrap"}`}>
          <button
            type="button"
            onClick={handleUpload}
            disabled={isDisabled}
            className="score-pill rounded-full px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isWorking ? "처리 중" : "현재 로컬 데이터를 Supabase에 백업"}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDisabled}
            className="score-pill rounded-full px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isWorking ? "처리 중" : "Supabase 백업을 이 기기로 불러오기"}
          </button>
        </div>
      </div>

      <div className="mt-4">
        <InlineNoticeMessage message={message} />
      </div>
    </section>
  );
}
