import { useMemo } from "react";

function StarIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

export default function DestinationCard({
  destination,
  isFavorite,
  onToggleFavorite,
}) {
  const budgetLabel = useMemo(() => {
    const b = (destination?.budget || "").toLowerCase();
    if (b === "low") return "Low 💰";
    if (b === "medium") return "Medium 💰💰";
    if (b === "high") return "High 💰💰💰";
    return destination?.budget || "—";
  }, [destination?.budget]);

  const imageUrl = useMemo(() => {
    const name = destination?.name || "destination";
    if (destination?.image) return destination.image;
    // Image fallback (matches your spec).
    const q = encodeURIComponent(name);
    return `https://source.unsplash.com/featured/?${q},travel`;
  }, [destination]);

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-[0_25px_70px_-40px_rgba(255,255,255,0.25)]">
      <div className="relative h-44 sm:h-48">
        <img
          src={imageUrl}
          alt={destination?.name ? `${destination.name} travel` : "Destination image"}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

        <button
          type="button"
          onClick={() => onToggleFavorite?.(destination?.id)}
          className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-white/90 backdrop-blur transition hover:bg-black/40"
          aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
        >
          <span className="text-xl leading-none">{isFavorite ? "♥" : "♡"}</span>
        </button>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-white sm:text-lg">
              {destination?.name}
            </h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-white/70">
              <StarIcon className="h-4 w-4 text-amber-300" />
              <span>
                {destination?.rating === null || destination?.rating === undefined
                  ? "—"
                  : Number(destination?.rating).toFixed(1)}
              </span>
            </div>
          </div>
          <div className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
            {budgetLabel}
          </div>
        </div>

        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/70">
          {destination?.description || "A curated experience crafted for you."}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/70">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            Best time: {destination?.bestTimeToVisit || "—"}
          </span>
        </div>
      </div>
    </article>
  );
}

