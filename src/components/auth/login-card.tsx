"use client";

import { AlertCircle, ArrowRight, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { useAuth } from "@/components/providers/auth-provider";

export function LoginCard() {
  const router = useRouter();
  const { signInWithEmail, signInWithGoogle, usingFirebase } = useAuth();
  const [email, setEmail] = useState("sonia@paynex.app");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleEmailLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await signInWithEmail(email);
      router.push("/dashboard");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to continue.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    setIsSubmitting(true);
    setError("");

    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to continue.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[1fr_0.88fr]">
        <section className="rounded-[2rem] bg-[#0f2f2a] p-8 text-white shadow-[0_35px_90px_rgba(15,47,42,0.18)] sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-emerald-100">
            <ShieldCheck className="h-4 w-4" />
            Firebase-ready auth
          </div>
          <h1 className="mt-8 text-5xl font-semibold tracking-tight">Welcome back to Paynex</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-emerald-50/80">
            Continue in demo mode instantly, or add Firebase environment variables to turn the same
            UI into a connected authentication and profile experience.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              ["Responsive onboarding", "Large inputs and strong spacing for a confident fintech feel."],
              ["Google sign-in path", "Already wired for Firebase when credentials are present."],
              ["Demo-safe sandbox", "Any email opens the experience without backend setup."],
              ["Reusable auth shell", "Fits landing, dashboard, and send flow under one design language."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
                <div className="text-xl font-semibold">{title}</div>
                <p className="mt-2 text-sm leading-6 text-emerald-50/75">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_35px_90px_rgba(15,23,42,0.08)] sm:p-10">
          <div className="mx-auto max-w-md">
            <div className="grid h-16 w-16 place-items-center rounded-3xl bg-[#eff9e7] text-[#163300]">
              <Mail className="h-7 w-7" />
            </div>
            <h2 className="mt-8 text-4xl font-semibold text-slate-950">Log in</h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Use your email to continue. In demo mode, any email address opens the dashboard.
            </p>

            <form className="mt-8 space-y-4" onSubmit={handleEmailLogin}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Email address</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-lg outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  placeholder="you@paynex.app"
                  required
                />
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-4 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-sm uppercase tracking-[0.24em] text-slate-400">Or</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full rounded-full border border-slate-300 px-5 py-4 text-base font-semibold text-slate-950 transition hover:border-slate-950"
              >
                Continue with Google
              </button>
              <button
                type="button"
                disabled
                className="w-full rounded-full border border-slate-200 px-5 py-4 text-base font-semibold text-slate-400"
              >
                Continue with Apple
              </button>
            </div>

            {error ? (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
              {usingFirebase
                ? "Firebase config detected. Email sign-in expects an existing account, and Google sign-in uses the configured provider."
                : "Demo mode is active. Add NEXT_PUBLIC_FIREBASE_* values to switch into live Firebase auth without changing the UI."}
            </div>

            <p className="mt-6 text-sm leading-6 text-slate-500">
              By using Paynex, you agree to the sandbox privacy notice and user agreement.
              <Link href="/" className="ml-1 font-medium text-slate-950 underline">
                Back to home
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
