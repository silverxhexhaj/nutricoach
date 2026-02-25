"use client";

const STEPS = [
  { num: 1, title: "Your Stats", desc: "Weight, height, age, and primary goal." },
  { num: 2, title: "Your Lifestyle", desc: "Training schedule, diet preferences, restrictions." },
  { num: 3, title: "Generate", desc: "AI builds your full plan in about 30 seconds." },
];

interface StepIndicatorProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="onboard-steps">
      {STEPS.map((step) => {
        const isActive = currentStep === step.num;
        const isDone = currentStep > step.num;
        return (
          <div
            key={step.num}
            className={`onboard-step ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}
            onClick={() => onStepClick(step.num)}
            onKeyDown={(e) => e.key === "Enter" && onStepClick(step.num)}
            role="button"
            tabIndex={0}
          >
            <div className="onboard-step-num">{step.num}</div>
            <div>
              <h4 className="font-heading font-bold text-base">{step.title}</h4>
              <p className="text-text-dim text-[0.87rem] mt-1 leading-relaxed">{step.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
