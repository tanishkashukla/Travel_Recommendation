import { useContext, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

void motion;

const BG_IMAGE =
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80";

export default function AuthPage() {
  const { signIn, signUp } = useContext(AuthContext);
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // login | signup
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const isSignup = mode === "signup";
  const title = useMemo(
    () => (isSignup ? "Create your account" : "Welcome back"),
    [isSignup]
  );

  const handleContinue = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) return setError("Please enter your email.");
    if (password.trim().length < 4)
      return setError("Password must be at least 4 characters.");
    if (isSignup && !name.trim()) return setError("Please enter your name.");

    setBusy(true);
    try {
      if (isSignup) {
        await signUp({ name: name.trim(), email: email.trim(), password });
      } else {
        await signIn({ email: email.trim(), password });
      }
      navigate("/home");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[100svh] bg-[#07070b]">
      <div className="relative grid min-h-[100svh] grid-cols-1 lg:grid-cols-2">
        <div
          className="relative hidden overflow-hidden lg:block"
          aria-hidden="true"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${BG_IMAGE})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/25 via-cyan-400/10 to-black/70" />
          <div className="relative flex h-full items-end p-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur">
                <span className="text-lg">✈️</span>
                <span>Curated destinations based on your vibe</span>
              </div>
              <h1 className="mt-5 max-w-md text-4xl font-semibold tracking-tight text-white">
                Discover your next journey
              </h1>
              <p className="mt-3 max-w-md text-white/70">
                Answer a few questions and get personalized travel cards with
                images.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="flex items-center justify-center p-4 lg:p-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_120px_-60px_rgba(255,255,255,0.35)] backdrop-blur-xl"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-white/60">
                  {isSignup ? "Signup" : "Login"}
                </div>
                <h2 className="mt-1 text-2xl font-semibold text-white">
                  {title}
                </h2>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-1">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className={[
                      "rounded-xl px-3 py-2 text-sm transition",
                      mode === "login"
                        ? "bg-white/15 text-white"
                        : "text-white/60 hover:text-white",
                    ].join(" ")}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className={[
                      "rounded-xl px-3 py-2 text-sm transition",
                      mode === "signup"
                        ? "bg-white/15 text-white"
                        : "text-white/60 hover:text-white",
                    ].join(" ")}
                  >
                    Signup
                  </button>
                </div>
              </div>
            </div>

            <form className="mt-6" onSubmit={handleContinue}>
              {isSignup ? (
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-white/80">
                    Name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-fuchsia-400/60 focus:ring-2 focus:ring-fuchsia-300/20"
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </div>
              ) : null}

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-fuchsia-400/60 focus:ring-2 focus:ring-fuchsia-300/20"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Password
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-fuchsia-400/60 focus:ring-2 focus:ring-fuchsia-300/20"
                  placeholder="••••••••"
                  type="password"
                  autoComplete={isSignup ? "new-password" : "current-password"}
                />
              </div>

              {error ? (
                <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              <motion.button
                whileHover={{ scale: busy ? 1 : 1.01 }}
                whileTap={{ scale: busy ? 1 : 0.99 }}
                type="submit"
                disabled={busy}
                className="w-full rounded-3xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-black shadow-[0_20px_80px_-30px_rgba(192,132,252,0.9)] transition disabled:opacity-60"
              >
                {busy ? "Continuing..." : "Continue"}
              </motion.button>

              <p className="mt-4 text-center text-xs text-white/50">
                Demo auth (frontend-only). Recommendations come from your API.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

