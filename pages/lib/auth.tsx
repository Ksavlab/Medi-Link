import { FormEvent, useState } from "react";
import Head from "next/head";
import { supabase } from "../lib/supabase-browser";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (mode === "signup") {
        if (!fullName.trim()) {
          setMessage("Please enter your full name.");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (error) throw error;

        if (!data.session) {
          setMessage(
            "Account created. Please check your email and confirm your account before logging in."
          );
        } else {
          setMessage("Account created successfully.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        window.location.href = "/";
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>{mode === "login" ? "Login" : "Create Account"} | MediLink</title>
      </Head>

      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-md">
          <div className="mb-8 text-center">
            <a
              href="/"
              className="text-2xl font-black text-emerald-700"
            >
              + MediLink
            </a>

            <h1 className="mt-6 text-3xl font-black text-slate-900">
              {mode === "login"
                ? "Welcome back"
                : "Create your MediLink account"}
            </h1>

            <p className="mt-2 text-slate-500">
              {mode === "login"
                ? "Sign in to access your MediLink account."
                : "Create an account to access MediLink services."}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            {mode === "signup" && (
              <div className="mb-4">
                <label className="text-sm font-bold text-slate-700">
                  Full name
                </label>

                <input
                  className="input mt-2 w-full"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
            )}

            <div className="mb-4">
              <label className="text-sm font-bold text-slate-700">
                Email
              </label>

              <input
                className="input mt-2 w-full"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="mb-5">
              <label className="text-sm font-bold text-slate-700">
                Password
              </label>

              <input
                className="input mt-2 w-full"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </div>

            {message && (
              <div className="mb-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Login"
                : "Create account"}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setMessage("");
              }}
              className="mt-4 w-full text-sm font-semibold text-emerald-700"
            >
              {mode === "login"
                ? "Don't have an account? Create one"
                : "Already have an account? Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            MediLink · Healthcare access simplified
          </p>
        </div>
      </main>
    </>
  );
}
