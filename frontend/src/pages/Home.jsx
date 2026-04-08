import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import DestinationCard from "../components/DestinationCard";
import { getAllDestinations } from "../services/api";
import { getFavoriteIds, setFavoriteIds } from "../utils/favorites";
import LoadingScreen from "./LoadingScreen";

export default function Home() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [allDestinations, setAllDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState(() => getFavoriteIds());
  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);
  const [offset, setOffset] = useState(0);
  const [endReached, setEndReached] = useState(false);
  const PAGE_SIZE = 24;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getAllDestinations({ limit: PAGE_SIZE, offset: 0 });
        if (!cancelled) {
          setAllDestinations(data);
          setOffset(data.length ? PAGE_SIZE : 0);
          setEndReached(!data || data.length < PAGE_SIZE);
        }
      } catch {
        if (!cancelled) setError("Could not load destinations right now.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleFavorite = (id) => {
    if (!id) return;
    let next = [];
    if (favoriteSet.has(id)) {
      next = favorites.filter((x) => x !== id);
    } else {
      next = [...favorites, id];
    }
    setFavorites(next);
    setFavoriteIds(next);
  };

  if (loading) return <LoadingScreen message="Loading all destinations..." />;

  return (
    <main className="relative min-h-[100svh] bg-[#07070b] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(192,132,252,0.25),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(34,211,238,0.18),transparent_50%)]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-start justify-center gap-8 px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
        <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 backdrop-blur">
          <span className="text-lg">✈️</span>
          <span>Premium destination matching</span>
        </div>

        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Discover Your Perfect Destination
          <span className="block bg-gradient-to-r from-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
            {" "}
            ✈️
          </span>
        </h1>

        <p className="max-w-2xl text-white/70 sm:text-lg">
          Answer a few questions and find your ideal trip. Tailored results
          include images, budget, rating, and best time to visit.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => navigate("/questionnaire")}
            className="rounded-3xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-black shadow-[0_25px_120px_-70px_rgba(192,132,252,0.9)] transition hover:brightness-110"
          >
            Start Exploring
          </button>

          <div className="text-sm text-white/60">
            {user ? (
              <>
                Signed in as{" "}
                <span className="font-semibold text-white/80">{user.name}</span>
              </>
            ) : (
              <>Sign in to save favorites.</>
            )}
          </div>
        </div>

        <div className="mt-4 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              title: "One-question flow",
              desc: "MCQ quiz with progress bar.",
            },
            {
              title: "Image-based cards",
              desc: "API images with Unsplash fallback.",
            },
            {
              title: "Favorites + dark mode",
              desc: "Save trips and switch themes.",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
            >
              <div className="text-sm font-semibold text-white/90">
                {c.title}
              </div>
              <div className="mt-1 text-sm text-white/60">{c.desc}</div>
            </div>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-between w-full">
          <h2 className="text-xl font-semibold">All destinations</h2>
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
          >
            View Profile
          </button>
        </div>

        {error ? (
          <div className="w-full rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {allDestinations.map((d) => (
            <DestinationCard
              key={d.id}
              destination={d}
              isFavorite={favoriteSet.has(d.id)}
              onToggleFavorite={toggleFavorite}
              onViewDetails={(id) => navigate(`/destination/${id}`)}
            />
          ))}
        </div>

        {!endReached ? (
          <div className="mt-7 flex justify-center">
            <button
              type="button"
              onClick={async () => {
                setError("");
                setLoading(true);
                try {
                  const data = await getAllDestinations({
                    limit: PAGE_SIZE,
                    offset,
                  });
                  setAllDestinations((prev) => [...prev, ...(data || [])]);
                  setOffset((prev) => prev + (data?.length || 0));
                  if (!data || data.length < PAGE_SIZE) setEndReached(true);
                } catch {
                  setError("Could not load more destinations.");
                } finally {
                  setLoading(false);
                }
              }}
              className="rounded-3xl border border-white/10 bg-white/5 px-6 py-3 text-sm text-white/80 hover:bg-white/10 transition"
            >
              Load more
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}

