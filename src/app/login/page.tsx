"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { LoginGradient } from "@/components/ui/stripe-like-gradient-shader";

// Inner component uses useSearchParams — must be inside a Suspense boundary
// (required by Next.js App Router when the page is statically rendered).
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "שגיאה בהרשמה");
          return;
        }
      }

      // In NextAuth v5 beta, signIn("credentials", { redirect: false }) from
      // next-auth/react returns { ok, error, status, url } — never undefined.
      // If it returned a redirect (redirect:true behavior fell through), we'd
      // see a navigation, not an object. We always use redirect:false here.
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result) {
        // Unexpected — treat as success and navigate
        router.push(callbackUrl);
        router.refresh();
        return;
      }

      if (result.error) {
        setError("אימייל או סיסמה שגויים");
        return;
      }

      // Success: refresh the router so the middleware / server components
      // pick up the newly-set session cookie, then navigate to the target.
      router.refresh();
      router.push(callbackUrl);
    } catch {
      setError("אירעה שגיאה, נסי שוב");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
      style={{ background: "transparent" }}
    >
      <LoginGradient />
      {/* Logo */}
      <div className="mb-8 text-center">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg"
          style={{ background: "var(--color-primary)" }}
        >
          <svg viewBox="87 90 348 348" width="44" height="44">
            {/* Row 1 */}
            <circle cx="241" cy="200" r="31" fill="white" opacity="0.95"/>
            <circle cx="273" cy="200" r="31" fill="white" opacity="0.95"/>
            {/* Row 2 */}
            <circle cx="202" cy="244" r="31" fill="white" opacity="0.80"/>
            <circle cx="241" cy="244" r="31" fill="white" opacity="0.95"/>
            <circle cx="273" cy="244" r="31" fill="white" opacity="0.95"/>
            <circle cx="312" cy="244" r="31" fill="white" opacity="0.80"/>
            {/* Row 3 */}
            <circle cx="183" cy="286" r="31" fill="white" opacity="0.75"/>
            <circle cx="222" cy="286" r="31" fill="white" opacity="0.95"/>
            <circle cx="261" cy="286" r="31" fill="white" opacity="0.95"/>
            <circle cx="300" cy="286" r="31" fill="white" opacity="0.95"/>
            <circle cx="339" cy="286" r="31" fill="white" opacity="0.75"/>
            {/* Row 4 */}
            <circle cx="202" cy="326" r="31" fill="white" opacity="0.80"/>
            <circle cx="241" cy="326" r="31" fill="white" opacity="0.95"/>
            <circle cx="273" cy="326" r="31" fill="white" opacity="0.95"/>
            <circle cx="312" cy="326" r="31" fill="white" opacity="0.80"/>
            {/* Row 5 */}
            <circle cx="222" cy="364" r="29" fill="white" opacity="0.90"/>
            <circle cx="257" cy="364" r="29" fill="white" opacity="0.95"/>
            <circle cx="292" cy="364" r="29" fill="white" opacity="0.80"/>
            {/* Row 6 */}
            <circle cx="238" cy="399" r="27" fill="white" opacity="0.90"/>
            <circle cx="274" cy="399" r="27" fill="white" opacity="0.90"/>
            {/* Leaves */}
            <path d="M257 176 C253 158 249 138 257 118 C265 138 261 158 257 176Z" fill="white" opacity="0.70"/>
            <path d="M236 181 C217 165 209 144 216 124 C229 132 235 152 236 181Z" fill="white" opacity="0.60"/>
            <path d="M278 181 C297 165 305 144 298 124 C285 132 279 152 278 181Z" fill="white" opacity="0.60"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>קאונטי</h1>
        <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>מעקב קלוריות חכם מבוסס AI</p>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-3xl p-6 shadow-lg"
        style={{ background: "white", border: "1px solid var(--color-border)" }}
      >
        {/* Toggle */}
        <div
          className="flex rounded-2xl p-1 mb-5"
          style={{ background: "var(--color-border)" }}
        >
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: mode === m ? "white" : "transparent",
                color: mode === m ? "var(--color-primary)" : "var(--color-text-muted)",
                boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {m === "login" ? "התחברות" : "הרשמה"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <input
              type="text"
              placeholder="שם מלא"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
              style={{
                border: "1.5px solid var(--color-border)",
                background: "var(--color-bg)",
                color: "var(--color-text-primary)",
              }}
            />
          )}
          <input
            type="email"
            placeholder="אימייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
            style={{
              border: "1.5px solid var(--color-border)",
              background: "var(--color-bg)",
              color: "var(--color-text-primary)",
            }}
          />
          <input
            type="password"
            placeholder={mode === "register" ? "סיסמה (לפחות 6 תווים)" : "סיסמה"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
            style={{
              border: "1.5px solid var(--color-border)",
              background: "var(--color-bg)",
              color: "var(--color-text-primary)",
            }}
          />

          {error && (
            <p className="text-xs text-center font-medium" style={{ color: "#e05" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl text-white text-sm font-semibold transition-opacity disabled:opacity-60"
            style={{ background: "var(--color-primary)" }}
          >
            {loading ? "..." : mode === "login" ? "התחברי" : "הרשמי"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>או</span>
          <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
        </div>

        <div className="space-y-2">
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-sm font-semibold transition-all active:scale-95"
            style={{
              border: "1.5px solid var(--color-border)",
              background: "white",
              color: "var(--color-text-primary)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.1 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.5 7.1 29 5 24 5 12.9 5 4 13.9 4 25s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.5 7.1 29 5 24 5c-7.7 0-14.3 4.4-17.7 9.7z"/>
              <path fill="#4CAF50" d="M24 45c4.9 0 9.4-1.9 12.8-4.9l-5.9-5c-2 1.4-4.5 2.2-6.9 2.2-5.3 0-9.7-3-11.3-7.2L6.1 35.1C9.5 40.6 16.2 45 24 45z"/>
              <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.3 4-4.2 5.3l5.9 5c-.4.3 6.5-4.7 6.5-13.3 0-1.3-.1-2.6-.4-3.9z"/>
            </svg>
            המשך עם Google
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="mt-8 flex gap-5 text-center">
        {[
          { icon: "🎯", text: "דיוק מותאם אישית" },
          { icon: "🤖", text: "AI חכם" },
          { icon: "📊", text: "מעקב אישי" },
          { icon: "🔒", text: "פרטיות מלאה" },
        ].map(({ icon, text }) => (
          <div key={text} className="flex flex-col items-center gap-1">
            <span className="text-2xl">{icon}</span>
            <span className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>{text}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-center px-8" style={{ color: "var(--color-text-muted)" }}>
        האפליקציה היחידה שמאפשרת לך לקבוע כמה שאלות ה-AI ישאל — ממינימום ועד דיוק מירבי
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
