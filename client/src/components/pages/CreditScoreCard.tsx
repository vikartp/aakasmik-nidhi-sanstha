import { Target, Info } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export default function CreditScoreCard({ score = 100 }: { score?: number }) {
  let category = 'Very Bad';
  let color = 'text-red-600 dark:text-red-400';
  let bg = 'bg-red-100 dark:bg-red-900/30';
  let border = 'border-red-200 dark:border-red-800/50';
  let progressColor = 'bg-red-500';

  if (score >= 95) {
    category = 'Great';
    color = 'text-emerald-600 dark:text-emerald-400';
    bg = 'bg-emerald-50 dark:bg-emerald-900/30';
    border = 'border-emerald-200 dark:border-emerald-800/50';
    progressColor = 'bg-emerald-500';
  } else if (score >= 80) {
    category = 'Good';
    color = 'text-blue-600 dark:text-blue-400';
    bg = 'bg-blue-50 dark:bg-blue-900/30';
    border = 'border-blue-200 dark:border-blue-800/50';
    progressColor = 'bg-blue-500';
  } else if (score >= 70) {
    category = 'Average';
    color = 'text-amber-600 dark:text-amber-400';
    bg = 'bg-amber-50 dark:bg-amber-900/30';
    border = 'border-amber-200 dark:border-amber-800/50';
    progressColor = 'bg-amber-500';
  } else if (score >= 50) {
    category = 'Bad';
    color = 'text-orange-600 dark:text-orange-400';
    bg = 'bg-orange-50 dark:bg-orange-900/30';
    border = 'border-orange-200 dark:border-orange-800/50';
    progressColor = 'bg-orange-500';
  }

  return (
    <div
      className={`mt-4 mb-4 mx-2 flex flex-col items-center border rounded-2xl p-6 shadow-sm backdrop-blur-sm ${bg} ${border}`}
    >
      <div className="flex items-center gap-2 mb-2 relative w-full justify-center">
        <Target className={`w-5 h-5 ${color}`} />
        <span
          className={`font-semibold uppercase tracking-wider text-xs ${color}`}
        >
          Credit Score
        </span>
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={`absolute right-0 ${color} hover:opacity-70 transition-opacity`}
              aria-label="Credit Score Info"
            >
              <Info className="w-5 h-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-72 text-sm p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg"
            sideOffset={10}
          >
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Score Ranges
                </h4>
                <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-300">
                  <li>
                    <span className="text-emerald-500 font-medium">
                      95-100:
                    </span>{' '}
                    Great
                  </li>
                  <li>
                    <span className="text-blue-500 font-medium">80-94:</span>{' '}
                    Good
                  </li>
                  <li>
                    <span className="text-amber-500 font-medium">70-79:</span>{' '}
                    Average
                  </li>
                  <li>
                    <span className="text-orange-500 font-medium">50-69:</span>{' '}
                    Bad
                  </li>
                  <li>
                    <span className="text-red-500 font-medium">0-49:</span> Very
                    Bad
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Deduction Rules
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">
                  Based on your monthly payment date.
                </p>
                <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-300">
                  <li>
                    <span className="font-medium">1st - 7th:</span>{' '}
                    <span className="text-emerald-500 font-medium">
                      No deduction
                    </span>
                  </li>
                  <li>
                    <span className="font-medium">8th - 10th:</span>{' '}
                    <span className="text-amber-500 font-medium">
                      -2 points
                    </span>
                  </li>
                  <li>
                    <span className="font-medium">11th - 15th:</span>{' '}
                    <span className="text-orange-500 font-medium">
                      -5 points
                    </span>
                  </li>
                  <li>
                    <span className="font-medium">After 15th:</span>{' '}
                    <span className="text-red-500 font-medium">-8 points</span>
                  </li>
                </ul>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div
        className={`text-6xl font-black mb-1 ${color} tracking-tight drop-shadow-sm`}
      >
        {score}
      </div>
      <div className={`text-sm font-bold uppercase tracking-wider ${color}`}>
        {category}
      </div>

      {/* Visual Bar */}
      <div className="w-full max-w-xs bg-black/10 dark:bg-black/20 h-2.5 rounded-full mt-5 overflow-hidden shadow-inner">
        <div
          className={`h-full ${progressColor} transition-all duration-1000 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
}
