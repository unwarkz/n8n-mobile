import { useEffect, useState, useMemo } from 'react';
import { Activity, AlertCircle, CheckCircle2, XCircle, ArrowDownUp, Folder, FilterX } from 'lucide-react';
import { api } from '../api';
import { formatDistanceToNow } from 'date-fns';
import { useSearchParams } from 'react-router-dom';

type SortOption = 'startedAt' | 'runningTime';
type SortOrder = 'desc' | 'asc';
type GroupOption = 'none' | 'workflow' | 'status';

export default function ExecutionsScreen() {
  const [searchParams, setSearchParams] = useSearchParams();
  const workflowIdFilter = searchParams.get('workflowId');

  const [executions, setExecutions] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<SortOption>('startedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [groupBy, setGroupBy] = useState<GroupOption>('none');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [execRes, wfRes] = await Promise.all([
          api.getExecutions(),
          api.getWorkflows()
        ]);
        setExecutions(execRes.data || []);
        setWorkflows(wfRes.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const workflowMap = useMemo(() => {
    const map: Record<string, string> = {};
    workflows.forEach(w => {
      map[w.id] = w.name;
    });
    return map;
  }, [workflows]);

  const processedExecutions = useMemo(() => {
    let result = [...executions];

    if (workflowIdFilter) {
      result = result.filter(exec => exec.workflowId === workflowIdFilter);
    }

    // Map workflow names
    result = result.map(exec => ({
      ...exec,
      workflowName: workflowMap[exec.workflowId] || exec.workflowData?.name || `Workflow ID: ${exec.workflowId}`
    }));

    // Sort
    result.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      
      if (sortBy === 'startedAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else if (sortBy === 'runningTime') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Group
    const grouped: Record<string, any[]> = {};

    if (groupBy === 'none') {
      grouped['All Executions'] = result;
    } else {
      result.forEach(exec => {
        let key = 'Other';
        if (groupBy === 'workflow') {
          key = exec.workflowName;
        } else if (groupBy === 'status') {
          key = exec.status === 'success' ? 'Success' : exec.status === 'error' ? 'Error' : 'Other';
        }
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(exec);
      });
    }

    return grouped;
  }, [executions, workflowMap, sortBy, sortOrder, groupBy, workflowIdFilter]);

  const clearFilter = () => {
    searchParams.delete('workflowId');
    setSearchParams(searchParams);
  };

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Executions</h2>
          {workflowIdFilter && (
            <button 
              onClick={clearFilter}
              className="flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-lg font-medium"
            >
              <FilterX size={14} />
              Clear Filter
            </button>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 bg-white border border-neutral-200 rounded-xl px-3 py-2 flex items-center gap-2">
              <ArrowDownUp size={16} className="text-neutral-400" />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-sm w-full focus:outline-none"
              >
                <option value="startedAt">Started At</option>
                <option value="runningTime">Running Time</option>
              </select>
              <button 
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="text-neutral-400 hover:text-neutral-700"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
            <div className="flex-1 bg-white border border-neutral-200 rounded-xl px-3 py-2 flex items-center gap-2">
              <Folder size={16} className="text-neutral-400" />
              <select 
                value={groupBy} 
                onChange={(e) => setGroupBy(e.target.value as GroupOption)}
                className="bg-transparent text-sm w-full focus:outline-none"
              >
                <option value="none">No Grouping</option>
                <option value="workflow">By Workflow</option>
                <option value="status">By Status</option>
              </select>
            </div>
          </div>
        </div>
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
        <div className="flex-1 overflow-y-auto space-y-6 pb-4">
          {Object.entries(processedExecutions).length === 0 || Object.values(processedExecutions).every(arr => arr.length === 0) ? (
            <div className="text-center py-10 text-neutral-500">
              No recent executions.
            </div>
          ) : (
            Object.entries(processedExecutions).map(([groupName, groupExecutions]) => (
              groupExecutions.length > 0 && (
                <div key={groupName} className="space-y-3">
                  {groupBy !== 'none' && (
                    <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider px-1">
                      {groupName} <span className="text-neutral-400 font-normal">({groupExecutions.length})</span>
                    </h3>
                  )}
                  {groupExecutions.map((exec) => (
                    <div 
                      key={exec.id} 
                      className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {exec.status === 'success' ? (
                            <CheckCircle2 className="text-green-500 shrink-0" size={18} />
                          ) : exec.status === 'error' ? (
                            <XCircle className="text-red-500 shrink-0" size={18} />
                          ) : (
                            <Activity className="text-blue-500 shrink-0" size={18} />
                          )}
                          <h3 className="font-semibold text-neutral-900 line-clamp-1">
                            {exec.workflowName}
                          </h3>
                        </div>
                        <span className="text-xs font-mono text-neutral-400 shrink-0">#{exec.id}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span>{formatDistanceToNow(new Date(exec.startedAt), { addSuffix: true })}</span>
                        <span>{exec.runningTime}ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ))
          )}
        </div>
      )}
    </div>
  );
}
