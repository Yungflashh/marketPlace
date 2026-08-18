import React from 'react';
import { useReveal } from '../../hooks/useReveal';

interface Step {
  n: string;
  title: string;
  desc: string;
}

const ProcessTimeline: React.FC<{ steps: Step[] }> = ({ steps }) => {
  const ref = useReveal<HTMLDivElement>();

  return (
    <div ref={ref} className="reveal">
      {/* Desktop: horizontal connected nodes */}
      <div className="hidden md:grid grid-cols-3 gap-6 relative">
        <div className="absolute top-6 left-[calc(16.66%+1.5rem)] right-[calc(16.66%+1.5rem)] h-px bg-border overflow-hidden">
          <div className="timeline-fill h-full w-full bg-gradient-to-r from-primary via-primary to-accent" />
        </div>

        {steps.map((step, i) => (
          <div key={step.n} className="relative text-center">
            <div
              className="w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center text-[11px] font-bold tracking-wider mx-auto mb-5 relative z-10 font-mono animate-node-pulse"
              style={{ animationDelay: `${i * 0.3}s` }}
            >
              {step.n}
            </div>
            <h3 className="font-semibold text-ink text-[14px] mb-2">{step.title}</h3>
            <p className="text-[13px] text-ink-muted leading-relaxed max-w-xs mx-auto">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* Mobile: vertical connected nodes */}
      <div className="md:hidden relative pl-11">
        <div className="absolute top-1 left-4 bottom-1 w-px bg-border overflow-hidden">
          <div className="timeline-fill-v h-full w-full bg-gradient-to-b from-primary via-primary to-accent" />
        </div>
        <div className="space-y-8">
          {steps.map((step) => (
            <div key={step.n} className="relative">
              <div className="absolute -left-11 top-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-[10px] font-bold font-mono z-10">
                {step.n}
              </div>
              <h3 className="font-semibold text-ink text-[14px] mb-1.5">{step.title}</h3>
              <p className="text-[12.5px] text-ink-muted leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProcessTimeline;
