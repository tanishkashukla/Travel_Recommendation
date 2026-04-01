import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import QuestionCard from "../components/QuestionCard";
import { getAllDestinations } from "../services/api";
import { generatePersonalizedRecommendations } from "../utils/personalization";
import LoadingScreen from "./LoadingScreen";

void motion;

export default function Questionnaire() {
  const navigate = useNavigate();

  const questions = useMemo(
    () => [
      {
        key: "visitedPlaces",
        prompt: "What places have you already visited?",
        type: "text",
        placeholder: "e.g. Goa, Manali, Jaipur",
      },
      {
        key: "bestTripWhy",
        prompt: "Which trip did you enjoy the most and why?",
        type: "textarea",
        placeholder: "Share what made it memorable...",
      },
      {
        key: "placeTypes",
        prompt: "What type of places do you like?",
        type: "multi",
        options: [
          { value: "beaches", label: "Beaches", icon: "🏖️" },
          { value: "mountains", label: "Mountains", icon: "🏔️" },
          { value: "historical", label: "Historical", icon: "🏛️" },
          { value: "adventure", label: "Adventure", icon: "🎒" },
          { value: "luxury", label: "Luxury", icon: "✨" },
          { value: "nature", label: "Nature", icon: "🌳" },
          { value: "nightlife", label: "Nightlife", icon: "🌃" },
        ],
      },
      {
        key: "budget",
        prompt: "What is your usual travel budget?",
        type: "single",
        options: [
          { value: "low", label: "Low", icon: "💰" },
          { value: "medium", label: "Medium", icon: "💰💰" },
          { value: "high", label: "High", icon: "💰💰💰" },
        ],
      },
      {
        key: "duration",
        prompt: "Preferred travel duration",
        type: "single",
        options: [
          { value: "weekend", label: "Weekend", icon: "🧳" },
          { value: "3-5days", label: "3–5 days", icon: "📅" },
          { value: "1week", label: "1 week", icon: "🗓️" },
          { value: "2plusweeks", label: "2+ weeks", icon: "🌍" },
        ],
      },
      {
        key: "travelWith",
        prompt: "Who do you usually travel with?",
        type: "single",
        options: [
          { value: "solo", label: "Solo", icon: "🧍" },
          { value: "friends", label: "Friends", icon: "🧑‍🤝‍🧑" },
          { value: "family", label: "Family", icon: "👨‍👩‍👧‍👦" },
          { value: "partner", label: "Partner", icon: "💑" },
        ],
      },
      {
        key: "activities",
        prompt: "Preferred activities",
        type: "multi",
        options: [
          { value: "trekking", label: "Trekking", icon: "🥾" },
          { value: "shopping", label: "Shopping", icon: "🛍️" },
          { value: "food exploration", label: "Food exploration", icon: "🍜" },
          { value: "photography", label: "Photography", icon: "📸" },
          { value: "relaxation", label: "Relaxation", icon: "😌" },
          { value: "water sports", label: "Water sports", icon: "🏄" },
        ],
      },
      {
        key: "weather",
        prompt: "Preferred weather",
        type: "single",
        options: [
          { value: "cold", label: "Cold", icon: "❄️" },
          { value: "moderate", label: "Moderate", icon: "🌤️" },
          { value: "warm", label: "Warm", icon: "☀️" },
        ],
      },
      {
        key: "regionType",
        prompt: "Domestic or international?",
        type: "single",
        options: [
          { value: "domestic", label: "Domestic", icon: "🇮🇳" },
          { value: "international", label: "International", icon: "🌎" },
        ],
      },
      {
        key: "dreamDestination",
        prompt: "Any dream destination?",
        type: "text",
        placeholder: "e.g. Bali, Switzerland, Ladakh",
      },
    ],
    []
  );

  const total = questions.length;
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({
    visitedPlaces: "",
    bestTripWhy: "",
    placeTypes: [],
    budget: "",
    duration: "",
    travelWith: "",
    activities: [],
    weather: "",
    regionType: "",
    dreamDestination: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const current = questions[stepIndex];
  const selectedValue = answers[current.key];

  const progress = ((stepIndex + 1) / total) * 100;

  const setAnswer = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    setError("");
    if (!selectedValue) return;
    if (stepIndex < total - 1) setStepIndex((i) => i + 1);
  };

  const handleBack = () => {
    setError("");
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  const handleSubmit = async () => {
    setError("");

    // Basic completeness check
    const requiredKeys = questions.map((q) => q.key);
    for (const k of requiredKeys) {
      const val = answers[k];
      const empty = Array.isArray(val) ? val.length === 0 : !String(val || "").trim();
      if (empty) {
        setError("Please answer all questions.");
        return;
      }
    }

    setBusy(true);
    try {
      const allDestinations = await getAllDestinations();
      const recommendations = generatePersonalizedRecommendations(
        allDestinations,
        answers,
        5
      );
      navigate("/results", {
        state: {
          results: recommendations,
          personalizationAnswers: answers,
        },
      });
    } catch {
      setError("Could not generate recommendations from dataset.");
    } finally {
      setBusy(false);
    }
  };

  if (busy) {
    return <LoadingScreen message="Generating your travel personality matches..." />;
  }

  return (
    <main className="relative min-h-[100svh] bg-[#07070b] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(192,132,252,0.20),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(34,211,238,0.15),transparent_50%)]" />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-white/70">
              Step {stepIndex + 1} of {total}
            </div>
            <div className="text-xs text-white/50">Your preferences</div>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-300"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.key}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <QuestionCard
              prompt={current.prompt}
              options={current.options}
              value={selectedValue}
              onChange={(v) => setAnswer(current.key, v)}
              type={current.type || "single"}
              placeholder={current.placeholder}
            />
          </motion.div>
        </AnimatePresence>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="mt-7 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={stepIndex === 0}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white/80 transition hover:bg-white/10 disabled:opacity-50"
          >
            Back
          </button>

          {stepIndex < total - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!selectedValue}
              className="rounded-2xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-6 py-2.5 text-sm font-semibold text-black shadow-[0_20px_80px_-40px_rgba(192,132,252,0.9)] transition disabled:opacity-50"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={false}
              className="rounded-2xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-6 py-2.5 text-sm font-semibold text-black shadow-[0_20px_80px_-40px_rgba(192,132,252,0.9)] transition disabled:opacity-50"
            >
              Generate My Personalized Top 5
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

