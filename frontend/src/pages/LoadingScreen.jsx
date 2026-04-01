import { motion } from "framer-motion";

void motion;

export default function LoadingScreen({ message }) {
  return (
    <div className="min-h-[100svh] bg-[#07070b] text-white">
      <div className="mx-auto flex min-h-[100svh] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
        >
          <div className="text-2xl font-semibold">✈️</div>
          <div className="mt-3 text-lg font-semibold">
            Finding the best destinations for you...
          </div>
          <div className="mt-2 text-sm text-white/60">
            {message || "Hold on—curating matches based on your preferences."}
          </div>

          <div className="mt-7 h-2 w-64 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full w-24 rounded-full bg-gradient-to-r from-fuchsia-400 to-cyan-300"
              animate={{ x: [0, 160, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

