"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { DailyRecords, NutritionFood, UserProfile } from "../types/routine";
import { createBrowserSupabaseClient } from "../lib/supabase/client";
import { getSupabaseEnvStatus } from "../lib/supabase/isSupabaseConfigured";
import { uploadRoutineBackupToSupabase } from "../lib/supabase/routineSync";

const AUTO_BACKUP_DELAY_MS = 4000;

type AutoBackupPhase = "off" | "waiting" | "saving" | "success" | "error";

export type SupabaseAutoBackupStatus = {
  phase: AutoBackupPhase;
  lastSavedAt: string | null;
  error: string | null;
};

type SupabaseAutoBackupPayload = {
  records: DailyRecords;
  customFoods: readonly NutritionFood[];
  profile: UserProfile;
  favoriteFoodIds: readonly string[];
};

type UseSupabaseAutoBackupParams = SupabaseAutoBackupPayload & {
  hasHydrated: boolean;
};

function createPayloadSignature(payload: SupabaseAutoBackupPayload) {
  return JSON.stringify(payload);
}

export function useSupabaseAutoBackup({
  hasHydrated,
  records,
  customFoods,
  profile,
  favoriteFoodIds,
}: UseSupabaseAutoBackupParams): SupabaseAutoBackupStatus {
  const envStatus = getSupabaseEnvStatus();
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<SupabaseAutoBackupStatus>({
    phase: "waiting",
    lastSavedAt: null,
    error: null,
  });
  const timerRef = useRef<number | null>(null);
  const waitingStatusTimerRef = useRef<number | null>(null);
  const isUploadingRef = useRef(false);
  const queuedSignatureRef = useRef<string | null>(null);
  const baselineUserIdRef = useRef<string | null>(null);
  const baselineSignatureRef = useRef<string | null>(null);
  const payloadRef = useRef<SupabaseAutoBackupPayload>({
    records,
    customFoods,
    profile,
    favoriteFoodIds,
  });
  const userIdRef = useRef<string | null>(null);

  const signature = useMemo(
    () => createPayloadSignature({ records, customFoods, profile, favoriteFoodIds }),
    [customFoods, favoriteFoodIds, profile, records],
  );

  useEffect(() => {
    payloadRef.current = {
      records,
      customFoods,
      profile,
      favoriteFoodIds,
    };
  }, [customFoods, favoriteFoodIds, profile, records]);

  useEffect(() => {
    userIdRef.current = session?.user.id ?? null;
  }, [session?.user.id]);

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

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (waitingStatusTimerRef.current !== null) {
      window.clearTimeout(waitingStatusTimerRef.current);
      waitingStatusTimerRef.current = null;
    }
  }, []);

  const scheduleUploadRef = useRef<(nextSignature: string) => void>(() => undefined);

  const runUpload = useCallback(async (nextSignature: string) => {
    const userId = userIdRef.current;
    if (!userId) {
      return;
    }

    if (isUploadingRef.current) {
      queuedSignatureRef.current = nextSignature;
      return;
    }

    isUploadingRef.current = true;
    setStatus((previous) => ({
      ...previous,
      phase: "saving",
      error: null,
    }));

    const result = await uploadRoutineBackupToSupabase({
      userId,
      ...payloadRef.current,
    });

    isUploadingRef.current = false;

    if (!result.ok) {
      setStatus((previous) => ({
        ...previous,
        phase: "error",
        error: result.error,
      }));
    } else {
      baselineSignatureRef.current = nextSignature;
      setStatus({
        phase: "success",
        lastSavedAt: new Date().toISOString(),
        error: null,
      });
    }

    const queuedSignature = queuedSignatureRef.current;
    queuedSignatureRef.current = null;

    if (queuedSignature && queuedSignature !== nextSignature) {
      scheduleUploadRef.current(queuedSignature);
    }
  }, []);

  const scheduleUpload = useCallback(
    (nextSignature: string) => {
      clearTimer();
      waitingStatusTimerRef.current = window.setTimeout(() => {
        waitingStatusTimerRef.current = null;
        setStatus((previous) => ({
          ...previous,
          phase: "waiting",
          error: null,
        }));
      }, 0);
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        void runUpload(nextSignature);
      }, AUTO_BACKUP_DELAY_MS);
    },
    [clearTimer, runUpload],
  );

  useEffect(() => {
    scheduleUploadRef.current = scheduleUpload;
  }, [scheduleUpload]);

  useEffect(() => {
    const userId = session?.user.id ?? null;

    if (!envStatus.isConfigured || !hasHydrated || !userId) {
      baselineUserIdRef.current = userId;
      baselineSignatureRef.current = signature;
      queuedSignatureRef.current = null;
      clearTimer();
      return;
    }

    if (baselineUserIdRef.current !== userId) {
      baselineUserIdRef.current = userId;
      baselineSignatureRef.current = signature;
      queuedSignatureRef.current = null;
      clearTimer();
      return;
    }

    if (baselineSignatureRef.current === signature) {
      return;
    }

    if (isUploadingRef.current) {
      queuedSignatureRef.current = signature;
      return;
    }

    scheduleUpload(signature);
  }, [clearTimer, envStatus.isConfigured, hasHydrated, scheduleUpload, session?.user.id, signature]);

  useEffect(
    () => () => {
      clearTimer();
    },
    [clearTimer],
  );

  if (!envStatus.isConfigured || !hasHydrated || !session) {
    return {
      phase: "off",
      lastSavedAt: status.lastSavedAt,
      error: null,
    };
  }

  return status;
}
