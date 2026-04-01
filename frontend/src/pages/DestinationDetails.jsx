import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingScreen from "./LoadingScreen";
import { getDestinationById } from "../services/api";
import { getFavoriteIds, setFavoriteIds } from "../utils/favorites";

export default function DestinationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState(() => getFavoriteIds());
  const isFavorite = useMemo(
    () => favorites.includes(Number(id)),
    [favorites, id]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getDestinationById(id);
        if (!cancelled) setDestination(data);
      } catch {
        if (!cancelled) setError("Could not load destination details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const toggleFavorite = () => {
    const numericId = Number(id);
    let next = [];
    if (favorites.includes(numericId)) {
      next = favorites.filter((x) => x !== numericId);
    } else {
      next = [...favorites, numericId];
    }
    setFavorites(next);
    setFavoriteIds(next);
  };

  const imageUrl = useMemo(() => {
    const name = destination?.name || "destination";
    if (destination?.image) return destination.image;
    return `https://source.unsplash.com/featured/?${encodeURIComponent(name)},travel`;
  }, [destination]);

  if (loading) return <LoadingScreen message="Loading destination details..." />;

  if (error) {
    return (
      <main className="min-h-[100svh] bg-[#07070b] px-4 py-10 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-400/30 bg-red-500/10 p-6">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100svh] bg-[#07070b] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
        >
          Back
        </button>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <img src={imageUrl} alt={destination?.name} className="h-72 w-full object-cover" />
          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold">{destination?.name}</h1>
                <p className="mt-1 text-white/70">
                  {destination?.city}, {destination?.state}
                </p>
              </div>
              <button
                type="button"
                onClick={toggleFavorite}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition"
              >
                {isFavorite ? "♥ Liked" : "♡ Like"}
              </button>
            </div>

            <p className="mt-5 text-white/80">{destination?.description || "No description available."}</p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Info label="Rating" value={destination?.rating ?? "—"} />
              <Info label="Best time" value={destination?.bestTimeToVisit || "—"} />
              <Info label="Category" value={destination?.placeCategory || "—"} />
              <Info label="Interest" value={destination?.interest || "—"} />
              <Info label="Crowd level" value={destination?.crowdLevel || "—"} />
              <Info label="Price fare" value={destination?.priceFare ?? "—"} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-wide text-white/50">{label}</div>
      <div className="mt-1 text-sm font-medium text-white/90">{value}</div>
    </div>
  );
}

