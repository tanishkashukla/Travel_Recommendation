import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DestinationCard from "../components/DestinationCard";
import { getDestinationById } from "../services/api";
import { getFavoriteIds, setFavoriteIds } from "../utils/favorites";
import LoadingScreen from "./LoadingScreen";

export default function Profile() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState(() => getFavoriteIds());
  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!favorites.length) {
        if (!cancelled) {
          setDestinations([]);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError("");

        const results = await Promise.allSettled(
          favorites.map((id) => getDestinationById(Number(id)))
        );
        const ok = results
          .filter((r) => r.status === "fulfilled")
          .map((r) => r.value);

        if (!cancelled) setDestinations(ok);
      } catch {
        if (!cancelled) setError("Could not load profile data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [favorites]);

  const likedDestinations = useMemo(
    () => destinations.filter((d) => favoriteSet.has(d.id)),
    [destinations, favoriteSet]
  );

  const toggleFavorite = (id) => {
    let next = [];
    if (favoriteSet.has(id)) next = favorites.filter((x) => x !== id);
    else next = [...favorites, id];
    setFavorites(next);
    setFavoriteIds(next);
  };

  if (loading) return <LoadingScreen message="Loading your profile..." />;

  return (
    <main className="min-h-[100svh] bg-[#07070b] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold">My Profile</h1>
            <p className="mt-1 text-sm text-white/60">
              Liked destinations are saved in your local profile.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
          >
            Go Home
          </button>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {likedDestinations.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {likedDestinations.map((d) => (
              <DestinationCard
                key={d.id}
                destination={d}
                isFavorite={favoriteSet.has(d.id)}
                onToggleFavorite={toggleFavorite}
                onViewDetails={(id) => navigate(`/destination/${id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white/70">
            You haven&apos;t liked any destinations yet. Browse Home and tap the heart icon.
          </div>
        )}
      </div>
    </main>
  );
}

