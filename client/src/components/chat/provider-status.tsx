import { Activity } from "lucide-react";

interface ProviderStatusProps {
  currentProvider: string;
}

export default function ProviderStatus({ currentProvider }: ProviderStatusProps) {
  const getStatusColor = (status: string) => {
    if (status.includes('Error')) return 'text-red-500';
    if (status.includes('Processing') || status.includes('Research') || status.includes('Responding')) return 'text-sofeia-amber';
    if (status.includes('Complete')) return 'text-sofeia-emerald';
    return 'text-sofeia-emerald';
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1 text-xs text-sofeia-slate-500">
        <div className={`w-2 h-2 rounded-full animate-pulse ${
          currentProvider.includes('Error') ? 'bg-red-500' :
          currentProvider.includes('Processing') || currentProvider.includes('Research') || currentProvider.includes('Responding') ? 'bg-sofeia-amber' :
          'bg-sofeia-emerald'
        }`}></div>
        <span className={getStatusColor(currentProvider)}>{currentProvider}</span>
      </div>
    </div>
  );
}
