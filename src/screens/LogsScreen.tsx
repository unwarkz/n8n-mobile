import React from 'react';
import { useStore } from '../store';
import { Trash2, Info, AlertCircle, AlertTriangle } from 'lucide-react';

export default function LogsScreen() {
  const { logs, clearLogs } = useStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle size={16} className="text-red-500" />;
      case 'warn': return <AlertTriangle size={16} className="text-yellow-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-50 border-red-100';
      case 'warn': return 'bg-yellow-50 border-yellow-100';
      default: return 'bg-white border-neutral-100';
    }
  };

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-neutral-900">App Logs</h2>
        {logs.length > 0 && (
          <button 
            onClick={clearLogs}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 size={16} />
            Clear
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200 border-dashed">
          <Info className="mx-auto text-neutral-300 mb-3" size={32} />
          <h3 className="text-neutral-900 font-medium">No logs yet</h3>
          <p className="text-neutral-500 text-sm mt-1">Make some requests to see logs here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div 
              key={log.id} 
              className={`p-3 rounded-xl border shadow-sm ${getBgColor(log.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {getIcon(log.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-sm text-neutral-900 truncate">
                      {log.message}
                    </h4>
                    <span className="text-[10px] text-neutral-500 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {log.details && (
                    <p className="text-xs text-neutral-600 break-words font-mono bg-white/50 p-2 rounded mt-2">
                      {log.details}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
