import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';

export interface PortalFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  colorClass?: string;
}

interface PortalGridProps {
  features: PortalFeature[];
  activeFeature: string | null;
  onSelectFeature: (id: string | null) => void;
  children: React.ReactNode; // The content of the active feature
  portalTitle: string;
  backButtonText?: string;
  subtitleText?: string;
}

export const PortalGrid: React.FC<PortalGridProps> = ({
  features,
  activeFeature,
  onSelectFeature,
  children,
  portalTitle,
  backButtonText = 'Go to Portal',
  subtitleText = 'Select a feature to manage',
}) => {
  const activeFeatureData = features.find(f => f.id === activeFeature);

  if (activeFeature && activeFeatureData) {
    return (
      <div className="w-full max-w-7xl mx-auto animate-fade-in-up border border-blue-200/50 dark:border-blue-900/50 bg-white/40 dark:bg-zinc-950/40 rounded-xl sm:rounded-2xl p-3 sm:p-6 mb-4 sm:mb-6 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-4 border-b border-gray-200 dark:border-gray-800 pb-3 sm:pb-4">
          <Button
            variant="ghost"
            className="flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-full px-2 sm:px-3 py-1.5 sm:py-2 h-auto"
            onClick={() => onSelectFeature(null)}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium text-xs sm:text-base">
              {backButtonText}
            </span>
          </Button>
          <div className="flex flex-col">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
              {portalTitle}
            </div>
            <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span
                className={
                  activeFeatureData.colorClass
                    ? activeFeatureData.colorClass.split(' ')[0]
                    : 'text-blue-500'
                }
              >
                {activeFeatureData.icon}
              </span>
              {activeFeatureData.title}
            </h2>
          </div>
        </div>
        <div className="bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-lg sm:rounded-xl border border-gray-200/80 dark:border-gray-800/80 p-2 sm:p-6 shadow-sm overflow-x-auto">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto border border-blue-200/50 dark:border-blue-900/50 bg-white/40 dark:bg-zinc-950/40 rounded-xl sm:rounded-2xl p-3 sm:p-6 mb-4 sm:mb-6 shadow-sm backdrop-blur-sm">
      <div className="mb-4 sm:mb-6 text-center">
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
          {portalTitle}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {subtitleText}
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
        {features.map((feature, index) => (
          <button
            key={feature.id}
            onClick={() => onSelectFeature(feature.id)}
            className={`group flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl border border-gray-200/60 dark:border-gray-800/60 bg-white/60 dark:bg-zinc-900/60 hover:bg-white dark:hover:bg-zinc-800 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 animate-staggered-fade-in`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div
              className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-1 sm:mb-2 transition-transform duration-300 group-hover:scale-110 ${feature.colorClass || 'text-blue-500 bg-blue-500/10'} dark:bg-opacity-20`}
            >
              {React.cloneElement(feature.icon as any, {
                className: 'w-4 h-4 sm:w-6 sm:h-6',
              })}
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-[10px] sm:text-sm text-center mb-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
              {feature.title}
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 text-center line-clamp-2 hidden sm:block">
              {feature.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
