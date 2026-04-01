export default function QuestionCard({
  prompt,
  options,
  value,
  onChange,
  type = "single",
  placeholder = "",
}) {
  if (type === "textarea") {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 sm:p-7 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-white sm:text-xl">{prompt}</h2>
          <p className="mt-1 text-sm text-white/60">Share your travel story.</p>
        </div>
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-36 w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/90 outline-none placeholder:text-white/40 focus:border-fuchsia-400/60"
        />
      </div>
    );
  }

  if (type === "text") {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 sm:p-7 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-white sm:text-xl">{prompt}</h2>
          <p className="mt-1 text-sm text-white/60">Type and continue.</p>
        </div>
        <input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/90 outline-none placeholder:text-white/40 focus:border-fuchsia-400/60"
        />
      </div>
    );
  }

  const multi = type === "multi";

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 sm:p-7 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white sm:text-xl">{prompt}</h2>
        <p className="mt-1 text-sm text-white/60">
          {multi ? "You can choose multiple options." : "Choose one option to continue."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((opt) => {
          const selected = multi
            ? Array.isArray(value) && value.includes(opt.value)
            : opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                if (!multi) {
                  onChange(opt.value);
                  return;
                }
                const current = Array.isArray(value) ? value : [];
                if (current.includes(opt.value)) {
                  onChange(current.filter((x) => x !== opt.value));
                } else {
                  onChange([...current, opt.value]);
                }
              }}
              className={[
                "group relative rounded-2xl border px-4 py-4 text-left transition",
                selected
                  ? "border-white/30 bg-gradient-to-br from-white/15 to-fuchsia-500/10 shadow-[0_18px_60px_-25px_rgba(192,132,252,0.65)]"
                  : "border-white/10 bg-white/5 hover:bg-white/10",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl leading-none">{opt.icon ?? ""}</div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white/90">
                    {opt.label}
                  </div>
                  {selected ? (
                    <div className="mt-2 inline-flex items-center gap-2 text-xs text-white/70">
                      <span className="h-2 w-2 rounded-full bg-gradient-to-r from-fuchsia-400 to-cyan-400" />
                      Selected
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-white/50">Tap to select</div>
                  )}
                </div>
              </div>

              <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/0 transition group-hover:ring-white/15" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

