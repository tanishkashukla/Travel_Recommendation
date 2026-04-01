import { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DestinationCard from "../components/DestinationCard";
import { recommendTravel } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import LoadingScreen from "./LoadingScreen";
import { getFavoriteIds, setFavoriteIds } from "../utils/favorites";

export default function Results() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const initialResults = location.state?.results || null;
  const initialPayload = location.state?.payload || null;

  const [results, setResults] = useState(initialResults || []);
  const [loading, setLoading] = useState(!initialResults);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState(() => getFavoriteIds());

  const favoriteSet = useMemo(() => new Set(favorites || []), [favorites]);

  useEffect(() => {
    if (initialResults) return;
    if (!initialPayload) {
      setError("Missing recommendation payload. Please start the quiz again.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await recommendTravel(initialPayload);
        if (!cancelled) setResults(data);
      } catch {
        if (!cancelled)
          setError("Could not fetch recommendations. Is the backend running?");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialPayload, initialResults, user?.id]);

  const persistFavorites = (next) => {
    setFavorites(next);
    setFavoriteIds(next);
  };

  const toggleFavorite = (id) => {
    if (!id) return;
    if (!user) {
      setError("Please login to save favorites.");
      return;
    }
    if (favoriteSet.has(id)) {
      persistFavorites((favorites || []).filter((x) => x !== id));
    } else {
      persistFavorites([...(favorites || []), id]);
    }
  };

  if (loading) return <LoadingScreen message="Fetching tailored trips for you..." />;

  return (
    <main className="relative min-h-[100svh] bg-[#07070b] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(192,132,252,0.20),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(34,211,238,0.15),transparent_50%)]" />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-white/70">
              Your recommendations
            </div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
              Destinations picked for your vibe
            </h1>
          </div>
          <button
            type="button"
            onClick={() => navigate("/questionnaire")}
            className="rounded-3xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white/80 backdrop-blur transition hover:bg-white/10"
          >
            Retake Quiz
          </button>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {results?.length ? (
          <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((d) => (
              <DestinationCard
                key={d.id ?? d.name}
                destination={d}
                isFavorite={favoriteSet.has(d.id)}
                onToggleFavorite={toggleFavorite}
                onViewDetails={(id) => navigate(`/destination/${id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-white/70">
            No results to show yet.
          </div>
        )}
      </div>
    </main>
  );
}

