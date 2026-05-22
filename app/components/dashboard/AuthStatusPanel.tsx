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

type AuthAction = "sign-in" | "sign-up" | "sign-out" | null;

function getNoticeClass(tone: AuthNotice["tone"]) {
  if (tone === "success") {
    return "border-slate-200 bg-white/82 text-slate-700";
  }

  if (tone === "error") {
    return "border-[#d6c1b1] bg-[#fbf7f3] text-[#8b5e3c]";
  }

  return "border-slate-200 bg-white/82 text-slate-600";
}

function getAuthErrorMessage(errorMessage: string, action: "sign-in" | "sign-up") {
  const normalizedMessage = errorMessage.toLowerCase();

  if (
    normalizedMessage.includes("invalid login credentials") ||
    normalizedMessage.includes("email not confirmed")
  ) {
    return action === "sign-in"
      ? "이메일 또는 비밀번호를 확인해 주세요. 가입 확인 메일이 남아 있다면 먼저 확인해 주세요."
      : "가입 정보를 확인해 주세요.";
  }

  if (normalizedMessage.includes("password")) {
    return "비밀번호를 확인해 주세요. 6자 이상으로 입력해 주세요.";
  }

  if (normalizedMessage.includes("email")) {
    return "이메일 주소를 확인해 주세요.";
  }

  return errorMessage;
}

export function AuthStatusPanel({ compact = false }: { compact?: boolean }) {
  const envStatus = getSupabaseEnvStatus();
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState<AuthNotice | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(envStatus.isConfigured);
  const [authAction, setAuthAction] = useState<AuthAction>(null);

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

  const getAuthCredentials = () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setNotice({ tone: "error", text: "이메일을 입력해 주세요." });
      return null;
    }

    if (password.length < 6) {
      setNotice({ tone: "error", text: "비밀번호를 6자 이상 입력해 주세요." });
      return null;
    }

    return {
      email: trimmedEmail,
      password,
    };
  };

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const credentials = getAuthCredentials();
    if (!credentials) {
      return;
    }

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setNotice({ tone: "error", text: "Supabase가 설정되어 있지 않습니다." });
      return;
    }

    setAuthAction("sign-in");
    setNotice(null);

    const { data, error } = await supabase.auth.signInWithPassword(credentials);

    setAuthAction(null);

    if (error) {
      setNotice({ tone: "error", text: getAuthErrorMessage(error.message, "sign-in") });
      return;
    }

    setSession(data.session);
    setNotice({
      tone: "success",
      text: "로그인되었습니다.",
    });
  };

  const handleSignUp = async () => {
    const credentials = getAuthCredentials();
    if (!credentials) {
      return;
    }

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setNotice({ tone: "error", text: "Supabase가 설정되어 있지 않습니다." });
      return;
    }

    setAuthAction("sign-up");
    setNotice(null);

    const { data, error } = await supabase.auth.signUp({
      ...credentials,
      options: {
        emailRedirectTo: typeof window === "undefined" ? undefined : window.location.origin,
      },
    });

    setAuthAction(null);

    if (error) {
      setNotice({ tone: "error", text: getAuthErrorMessage(error.message, "sign-up") });
      return;
    }

    setSession(data.session);
    setNotice({
      tone: "success",
      text: data.session
        ? "회원가입이 완료되어 로그인되었습니다."
        : "회원가입 요청을 보냈습니다. 가입 확인 메일을 확인해 주세요.",
    });
  };

  const handleSignOut = async () => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      return;
    }

    setAuthAction("sign-out");
    setNotice(null);

    const { error } = await supabase.auth.signOut();
    setAuthAction(null);

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
  const isSubmitting = authAction !== null;

  return (
    <section
      className={
        compact
          ? "rounded-[22px] border border-slate-200/80 bg-white/88 p-3.5"
          : "glass-panel rounded-[28px] p-4 sm:p-5"
      }
    >
      <div className={`flex flex-col gap-4 ${compact ? "" : "lg:flex-row lg:items-center lg:justify-between"}`}>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {compact ? "로그인" : "Supabase Auth"}
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-[-0.04em] text-slate-950">
            {isConfigured ? (session ? "로그인됨" : "이메일/비밀번호 로그인") : "Supabase 미설정"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isConfigured
              ? "기록은 이 기기에 저장되고, 로그인하면 클라우드 백업을 사용할 수 있습니다."
              : "설정이 끝나면 이메일/비밀번호 로그인을 사용할 수 있습니다."}
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
          <form onSubmit={handleSignIn} className={`grid gap-2 ${compact ? "" : "sm:min-w-[420px]"}`}>
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
            <label className="score-pill rounded-[20px] px-4 py-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">비밀번호</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="6자 이상"
                autoComplete="current-password"
                disabled={isSubmitting || isLoadingSession}
                className="mt-1.5 w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-300"
              />
            </label>
            <p className="px-1 text-xs leading-5 text-slate-400">비밀번호는 6자 이상을 권장합니다.</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="submit"
                disabled={isSubmitting || isLoadingSession}
                className="score-pill min-h-12 rounded-[20px] px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {authAction === "sign-in" ? "로그인 중" : "로그인"}
              </button>
              <button
                type="button"
                onClick={handleSignUp}
                disabled={isSubmitting || isLoadingSession}
                className="score-pill min-h-12 rounded-[20px] px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {authAction === "sign-up" ? "가입 중" : "회원가입"}
              </button>
            </div>
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
