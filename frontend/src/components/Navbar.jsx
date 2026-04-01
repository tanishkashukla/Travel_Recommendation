import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function ThemeToggleButton({ theme, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 backdrop-blur hover:bg-white/10 transition"
      aria-label="Toggle dark mode"
    >
      <span className="font-medium">{theme === "dark" ? "Dark" : "Light"}</span>
      <span className="h-2 w-2 rounded-full bg-gradient-to-r from-fuchsia-400 to-cyan-400" />
    </button>
  );
}

export default function Navbar() {
  const { user, signOut, theme, toggleTheme } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40">
      <div className="mx-auto flex w-full items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500/30 via-violet-500/20 to-cyan-400/20 border border-white/10">
            <span className="text-lg">✈️</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-white/90">Travel Recommender</div>
            <div className="text-xs text-white/60">Premium trip matching</div>
          </div>
        </div>

        <nav className="hidden items-center gap-5 md:flex">
          <NavLink
            to="/home"
            className={({ isActive }) =>
              `text-sm transition ${
                isActive ? "text-white" : "text-white/70 hover:text-white"
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/questionnaire"
            className={({ isActive }) =>
              `text-sm transition ${
                isActive ? "text-white" : "text-white/70 hover:text-white"
              }`
            }
          >
            Quiz
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggleButton theme={theme} onToggle={toggleTheme} />

          {user ? (
            <button
              type="button"
              onClick={() => {
                signOut();
                navigate("/auth");
              }}
              className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur hover:bg-white/10 transition md:inline-flex"
            >
              Logout
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

