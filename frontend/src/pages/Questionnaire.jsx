import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import QuestionCard from "../components/QuestionCard";
import { recommendTravel } from "../services/api";
import LoadingScreen from "./LoadingScreen";

void motion;

const DURATIONS = [
  { value: "short", label: "1–3 days" },
  { value: "medium", label: "4–7 days" },
  { value: "long", label: "7+ days" },
];

export default function Questionnaire() {
  const navigate = useNavigate();

  const questions = useMemo(
    () => [
      {
        key: "destination_type",
        prompt: "What type of destination do you prefer?",
        options: [
          { value: "mountains", label: "Mountains", icon: "🏔️" },
          { value: "beaches", label: "Beaches", icon: "🏖️" },
          { value: "city", label: "City", icon: "🌆" },
          { value: "nature", label: "Nature", icon: "🌳" },
        ],
      },
      {
        key: "budget",
        prompt: "What is your budget?",
        options: [
          { value: "low", label: "Low", icon: "💰" },
          { value: "medium", label: "Medium", icon: "💰💰" },
          { value: "high", label: "High", icon: "💰💰💰" },
        ],
      },
      {
        key: "experience",
        prompt: "What kind of experience are you looking for?",
        options: [
          { value: "adventure", label: "Adventure", icon: "🎒" },
          { value: "relaxation", label: "Relaxation", icon: "😌" },
          { value: "cultural", label: "Cultural", icon: "🏛️" },
          { value: "shopping", label: "Shopping", icon: "🛍️" },
        ],
      },
      {
        key: "climate",
        prompt: "Preferred climate?",
        options: [
          { value: "cold", label: "Cold", icon: "❄️" },
          { value: "moderate", label: "Moderate", icon: "🌤️" },
          { value: "hot", label: "Hot", icon: "☀️" },
        ],
      },
      {
        key: "duration",
        prompt: "Trip duration?",
        options: DURATIONS.map((d) => ({
          value: d.value,
          label: d.label,
          icon: "🗓️",
        })),
      },
      {
        key: "group",
        prompt: "Who are you traveling with?",
        options: [
          { value: "solo", label: "Solo", icon: "🧑‍🎤" },
          { value: "friends", label: "Friends", icon: "🧑‍🤝‍🧑" },
          { value: "family", label: "Family", icon: "👨‍👩‍👧‍👦" },
          { value: "couple", label: "Couple", icon: "💑" },
        ],
      },
      {
        key: "activity",
        prompt: "Preferred activity?",
        options: [
          { value: "trekking", label: "Trekking", icon: "🥾" },
          { value: "swimming", label: "Swimming", icon: "🏊" },
          { value: "sightseeing", label: "Sightseeing", icon: "📸" },
          { value: "nightlife", label: "Nightlife", icon: "🌃" },
        ],
      },
    ],
    []
  );

  const total = questions.length;
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({
    destination_type: "",
    budget: "",
    experience: "",
    climate: "",
    duration: "",
    group: "",
    activity: "",
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

  const buildPayload = () => ({
    destination_type: answers.destination_type,
    budget: answers.budget,
    experience: answers.experience,
    climate: answers.climate,
    duration: answers.duration,
    group: answers.group,
    activity: answers.activity,
  });

  const handleSubmit = async () => {
    setError("");
    if (!selectedValue) return;

    // Basic completeness check
    const requiredKeys = questions.map((q) => q.key);
    for (const k of requiredKeys) {
      if (!answers[k]) {
        setError("Please answer all questions.");
        return;
      }
    }

    setBusy(true);
    try {
      const payload = buildPayload();
      const results = await recommendTravel(payload);
      navigate("/results", { state: { results, payload } });
    } catch {
      setError("Could not fetch recommendations. Is the backend running?");
    } finally {
      setBusy(false);
    }
  };

  if (busy) {
    return <LoadingScreen />;
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
              disabled={!answers.activity}
              className="rounded-2xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-6 py-2.5 text-sm font-semibold text-black shadow-[0_20px_80px_-40px_rgba(192,132,252,0.9)] transition disabled:opacity-50"
            >
              Get My Recommendations
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

