"use client";

interface FormStep3Props {
  active?: boolean;
  summary: {
    name: string;
    goal: string;
    stats: string;
    training: string;
    diet: string;
    supplements: string;
  };
  isGenerating: boolean;
  streamLog: string[];
  error: string | null;
  onGenerate: () => void;
  onBack: () => void;
}

const STREAM_STEPS = [
  "Calculating your TDEE & macro targets…",
  "Building 7-day personalised meal plan…",
  "Scheduling your supplement stack…",
  "Generating shopping list by category…",
  "Writing training-synced workout guide…",
];

export function FormStep3({
  active = false,
  summary,
  isGenerating,
  streamLog,
  error,
  onGenerate,
  onBack,
}: FormStep3Props) {
  return (
    <div className={`form-step ${active ? "active" : ""}`} id="formStep3">
      {!isGenerating ? (
        <div>
          <h3 className="font-heading font-bold text-xl mb-6">Ready to generate!</h3>
          <div
            className="mb-5 p-5 rounded-xl text-[0.87rem]"
            style={{
              background: "rgba(184,240,74,0.05)",
              border: "1px solid rgba(184,240,74,0.1)",
            }}
          >
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <span className="text-text-dim">Name:</span>{" "}
                <strong>{summary.name || "You"}</strong>
              </div>
              <div>
                <span className="text-text-dim">Goal:</span>{" "}
                <strong className="text-green">{summary.goal || "Not set"}</strong>
              </div>
              <div>
                <span className="text-text-dim">Stats:</span> <strong>{summary.stats}</strong>
              </div>
              <div>
                <span className="text-text-dim">Training:</span>{" "}
                <strong>{summary.training}x/wk</strong>
              </div>
              <div>
                <span className="text-text-dim">Diet:</span> <strong>{summary.diet}</strong>
              </div>
              <div>
                <span className="text-text-dim">Supplements:</span>{" "}
                <strong>{summary.supplements}</strong>
              </div>
            </div>
          </div>
          <p className="text-text-dim text-[0.87rem] mb-5">
            Click <strong className="text-green">Generate My Plan</strong> — your full 7-day
            programme will be ready in ~30 seconds.
          </p>
          {error && <div className="error-box">{error}</div>}
          <div className="form-nav">
            <button type="button" className="btn-form-prev" onClick={onBack}>
              ← Back
            </button>
            <button type="button" className="btn-form-next" onClick={onGenerate}>
              ✨ Generate My Plan
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-5">
          <div className="loader-ring" />
          <h3 className="font-heading font-bold text-lg">Building your personalised plan…</h3>
          <p className="text-text-dim text-[0.87rem] mt-2">
            Hang tight — this takes about 30 seconds.
          </p>
          <div className="stream-log">
            {streamLog.map((line, i) => (
              <div key={i} className={line.startsWith("✅") ? "log-done" : ""}>
                {line}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
