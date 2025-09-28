import React from 'react';
import { Check } from 'lucide-react';

interface StepperProps {
  currentStageId: number;
  stages: string[];
  onStageClick?: (stageId: number) => void;
}

export const Stepper: React.FC<StepperProps> = ({ currentStageId, stages, onStageClick }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const stageId = index + 1;
          const isCompleted = stageId < currentStageId;
          const isCurrent = stageId === currentStageId;
          const isClickable = onStageClick && isCompleted;

          const StepperNode = (
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${isCompleted ? 'bg-primary border-primary text-white' : ''}
                  ${isCurrent ? 'bg-primary/20 border-primary text-primary font-bold' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-500' : ''}
                `}
              >
                {isCompleted ? <Check size={16} /> : stageId}
              </div>
              <p className={`mt-2 text-xs w-20 ${isCurrent ? 'font-semibold text-primary' : 'text-slate-500'}`}>{stage}</p>
            </div>
          );

          return (
            <React.Fragment key={stageId}>
              {isClickable ? (
                <button
                  onClick={() => onStageClick(stageId)}
                  className="transition-transform transform hover:scale-105"
                  aria-label={`View stage ${stageId}: ${stage}`}
                >
                  {StepperNode}
                </button>
              ) : (
                StepperNode
              )}
              {index < stages.length - 1 && (
                <div className={`flex-1 h-1 transition-colors duration-300 mx-2
                    ${stageId < currentStageId ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}
                `}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
