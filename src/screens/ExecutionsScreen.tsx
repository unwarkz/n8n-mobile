import { useEffect, useState } from 'react';
import { Activity, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../api';
import { formatDistanceToNow } from 'date-fns';

export default function ExecutionsScreen() {
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExecutions = async () => {
      try {
        const res = await api.getExecutions();
        setExecutions(res.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExecutions();
  }, []);

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-xl font-bold">Executions</h2>
      </div>

      {error && (
        <div className="p-4 mb-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700">
          <AlertCircle className="shrink-0 mt-0.5" size={20} />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3 pb-4">
          {executions.length === 0 ? (
            <div className="text-center py-10 text-neutral-500">
              No recent executions.
            </div>
          ) : (
            executions.map((exec) => (
              <div 
                key={exec.id} 
                className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {exec.status === 'success' ? (
                      <CheckCircle2 className="text-green-500" size={18} />
                    ) : exec.status === 'error' ? (
                      <XCircle className="text-red-500" size={18} />
                    ) : (
                      <Activity className="text-blue-500" size={18} />
                    )}
                    <h3 className="font-semibold text-neutral-900 line-clamp-1">
                      {exec.workflowData?.name || `Workflow ID: ${exec.workflowId}`}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-neutral-400">#{exec.id}</span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>{formatDistanceToNow(new Date(exec.startedAt), { addSuffix: true })}</span>
                  <span>{exec.runningTime}ms</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
