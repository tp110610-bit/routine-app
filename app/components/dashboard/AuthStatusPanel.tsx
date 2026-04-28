"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "../../lib/supabase/client";
import {
  getSupabaseEnvStatus,
  getSupabaseInvalidEnvMessage,
  getSupabaseMissingEnvMessage,
} from "../../lib/supabase/isSupabaseConfigured";

type AuthNotice = {
  tone: "neutral" | "success" | "error";
  text: string;
};

function getNoticeClass(tone: AuthNotice["tone"]) {
  if (tone === "success") {
    return "border-slate-200 bg-white/82 text-slate-700";
  }

  if (tone === "error") {
    return "border-[#d6c1b1] bg-[#fbf7f3] text-[#8b5e3c]";
  }

  return "border-slate-200 bg-white/82 text-slate-600";
}

export function AuthStatusPanel() {
  const envStatus = getSupabaseEnvStatus();
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState<AuthNotice | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(envStatus.isConfigured);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        setNotice({ tone: "error", text: error.message });
      }

      setSession(data.session);
      setIsLoadingSession(false);
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

  const handleSendMagicLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setNotice({ tone: "error", text: "이메일을 입력해 주세요." });
      return;
    }

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setNotice({ tone: "error", text: "Supabase가 설정되어 있지 않습니다." });
      return;
    }

    setIsSubmitting(true);
    setNotice(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        emailRedirectTo: typeof window === "undefined" ? undefined : window.location.origin,
      },
    });

    setIsSubmitting(false);

    if (error) {
      setNotice({ tone: "error", text: error.message });
      return;
    }

    setNotice({
      tone: "success",
      text: "로그인 링크를 보냈습니다. 이메일에서 링크를 확인해 주세요.",
    });
  };

  const handleSignOut = async () => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      return;
    }

    setIsSubmitting(true);
    setNotice(null);

    const { error } = await supabase.auth.signOut();
    setIsSubmitting(false);

    if (error) {
      setNotice({ tone: "error", text: error.message });
      return;
    }

    setNotice({ tone: "success", text: "로그아웃되었습니다." });
  };

  const isConfigured = envStatus.isConfigured;
  const userEmail = session?.user.email ?? "이메일 없음";
  const configurationNotice = isConfigured
    ? null
    : envStatus.missingKeys.length > 0
      ? getSupabaseMissingEnvMessage(envStatus.missingKeys)
      : getSupabaseInvalidEnvMessage(envStatus.invalidKeys);

  return (
    <section className="glass-panel rounded-[28px] p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Supabase Auth</p>
          <h2 className="mt-1 text-lg font-semibold tracking-[-0.04em] text-slate-950">
            {isConfigured ? (session ? "로그인됨" : "이메일 로그인") : "Supabase 미설정"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isConfigured
              ? "루틴 데이터는 아직 localStorage에만 저장됩니다."
              : "환경변수를 설정하면 이메일 로그인 UI를 사용할 수 있습니다."}
          </p>
        </div>

        {isConfigured && session ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-[20px] border border-slate-200/80 bg-white/88 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">계정</p>
              <p className="mt-1 break-all text-sm font-medium text-slate-800">{userEmail}</p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSubmitting}
              className="score-pill rounded-full px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "처리 중" : "로그아웃"}
            </button>
          </div>
        ) : null}

        {isConfigured && !session ? (
          <form onSubmit={handleSendMagicLink} className="grid gap-2 sm:min-w-[360px] sm:grid-cols-[1fr_auto]">
            <label className="score-pill rounded-[20px] px-4 py-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">이메일</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isSubmitting || isLoadingSession}
                className="mt-1.5 w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-300"
              />
            </label>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingSession}
              className="score-pill rounded-[20px] px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "전송 중" : "로그인 링크 받기"}
            </button>
          </form>
        ) : null}
      </div>

      {configurationNotice ? (
        <p role="status" className={`mt-4 rounded-[18px] border px-3.5 py-3 text-sm leading-5 ${getNoticeClass("neutral")}`}>
          {configurationNotice}
        </p>
      ) : null}

      {notice ? (
        <p role="status" className={`mt-4 rounded-[18px] border px-3.5 py-3 text-sm leading-5 ${getNoticeClass(notice.tone)}`}>
          {notice.text}
        </p>
      ) : null}
    </section>
  );
}
