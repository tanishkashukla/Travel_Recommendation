function normalize(s) {
  return String(s || "").toLowerCase().trim();
}

function splitCsvInput(text) {
  return String(text || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function estimateBudgetLabel(priceFare, fallbackBudget) {
  if (fallbackBudget) return fallbackBudget;
  const p = Number(priceFare);
  if (Number.isNaN(p)) return "Medium";
  if (p < 5000) return "Low";
  if (p < 15000) return "Medium";
  return "High";
}

function similarityPercent(score, maxScore) {
  if (maxScore <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((score / maxScore) * 100)));
}

function getUnsplashImage(name) {
  return `https://source.unsplash.com/featured/?${encodeURIComponent(
    name || "travel destination"
  )},travel`;
}

function fieldHasAny(text, list) {
  const t = normalize(text);
  return list.some((item) => t.includes(normalize(item)));
}

function mapPlaceTypeToHints(types) {
  const map = {
    beaches: ["beach", "coast", "island", "water"],
    mountains: ["mountain", "hill", "valley", "trek"],
    historical: ["heritage", "history", "fort", "temple", "museum"],
    adventure: ["adventure", "trek", "wildlife", "outdoor"],
    luxury: ["luxury", "resort", "premium", "urban"],
    nature: ["nature", "wildlife", "landscape", "forest"],
    nightlife: ["nightlife", "urban", "shopping", "city"],
  };
  return types.flatMap((t) => map[normalize(t)] || []);
}

export function generatePersonalizedRecommendations(destinations, answers, topN = 5) {
  const visited = splitCsvInput(answers.visitedPlaces);
  const likedTripText = normalize(answers.bestTripWhy);
  const dreamDestination = normalize(answers.dreamDestination);
  const preferredTypes = answers.placeTypes || [];
  const preferredActivities = answers.activities || [];
  const budget = normalize(answers.budget);
  const weather = normalize(answers.weather);
  const travelWith = normalize(answers.travelWith);
  const regionType = normalize(answers.regionType);

  const activityHints = preferredActivities.map(normalize);
  const typeHints = mapPlaceTypeToHints(preferredTypes);
  const allHints = [...activityHints, ...typeHints];

  const scored = (destinations || []).map((d) => {
    const name = d.name || "";
    const interest = d.interest || "";
    const category = d.placeCategory || "";
    const description = d.description || "";
    const haystack = `${name} ${interest} ${category} ${description}`;

    let score = 0;
    const reasons = [];

    if (fieldHasAny(haystack, allHints)) {
      score += 28;
      reasons.push("Matches your preferred place and activity style");
    }

    if (likedTripText && fieldHasAny(haystack, splitCsvInput(answers.visitedPlaces).concat([likedTripText]))) {
      score += 18;
      reasons.push("Similar vibe to your most loved trip");
    }

    if (dreamDestination && fieldHasAny(haystack, [dreamDestination])) {
      score += 20;
      reasons.push("Close to your dream destination interests");
    }

    if (budget) {
      const estBudget = estimateBudgetLabel(d.priceFare, d.budget).toLowerCase();
      if (estBudget === budget) {
        score += 12;
        reasons.push("Fits your usual budget range");
      }
    }

    if (weather && fieldHasAny(d.bestTimeToVisit, [weather])) {
      score += 8;
      reasons.push("Season aligns with your weather preference");
    }

    if (travelWith && fieldHasAny(haystack, [travelWith])) {
      score += 6;
      reasons.push(`Great for ${travelWith} travelers`);
    }

    if (regionType === "international") {
      // Dataset is domestic-heavy; keep scoring neutral but explain similarity.
      score += 2;
    }

    // Baseline quality signal
    score += Number(d.rating || 0) * 4;

    const visitedMatch = visited.some((v) => normalize(name).includes(normalize(v)));
    return { d, score, reasons, visitedMatch };
  });

  scored.sort((a, b) => b.score - a.score);
  const maxScore = scored.length ? scored[0].score : 1;

  const fresh = scored.filter((x) => !x.visitedMatch);
  const similarVisited = scored.filter((x) => x.visitedMatch);

  // Avoid visited places; allow one "similar place" fallback if needed.
  const selected = fresh.slice(0, topN);
  if (selected.length < topN && similarVisited.length) {
    selected.push(...similarVisited.slice(0, topN - selected.length));
  }

  return selected.slice(0, topN).map((item) => {
    const d = item.d;
    const estimatedBudget = estimateBudgetLabel(d.priceFare, d.budget);
    const topActivities = String(d.interest || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 3);

    return {
      id: d.id,
      name: d.name,
      image: d.image || getUnsplashImage(d.name),
      bestTimeToVisit: d.bestTimeToVisit || "Any season",
      estimatedBudget,
      topActivities: topActivities.length ? topActivities : ["Sightseeing", "Photography"],
      similarityToPastTrip: `${similarityPercent(item.score, maxScore)}% match`,
      whyMatch: item.reasons[0] || "Strong overall match to your travel personality",
      description: d.description || "",
      rating: d.rating,
      city: d.city,
      state: d.state,
    };
  });
}

