import { useMemo } from "react";

export default function RecommendationCard({ item, onViewDetails }) {
  const image = useMemo(
    () =>
      item?.image ||
      `https://source.unsplash.com/featured/?${encodeURIComponent(item?.name || "travel")},travel`,
    [item]
  );

  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="relative h-48">
        <img src={image} alt={item?.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs">
          {item?.similarityToPastTrip}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-white">{item?.name}</h3>
        <p className="mt-1 text-sm text-white/60">
          {item?.city}, {item?.state}
        </p>
        <p className="mt-3 text-sm text-white/80">{item?.whyMatch}</p>

        <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-white/75">
          <Info label="Best time" value={item?.bestTimeToVisit} />
          <Info label="Estimated budget" value={item?.estimatedBudget} />
          <Info label="Top activities" value={(item?.topActivities || []).join(", ")} />
        </div>

        <button
          type="button"
          onClick={() => onViewDetails?.(item?.id)}
          className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10 transition"
        >
          View Destination Details
        </button>
      </div>
    </article>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <span className="text-white/50">{label}: </span>
      <span className="text-white/90">{value || "—"}</span>
    </div>
  );
}

