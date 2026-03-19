import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GitMerge, Search, AlertCircle, Play, Settings } from 'lucide-react';
import { api } from '../api';
import { formatDistanceToNow } from 'date-fns';

export default function WorkflowsScreen() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const res = await api.getWorkflows();
        setWorkflows(res.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkflows();
  }, []);

  const filteredWorkflows = workflows.filter(w => 
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-4">Workflows</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input 
            type="text" 
            placeholder="Search workflows..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
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
        <div className="flex-1 overflow-y-auto space-y-3 pb-4">
          {filteredWorkflows.length === 0 ? (
            <div className="text-center py-10 text-neutral-500">
              No workflows found.
            </div>
          ) : (
            filteredWorkflows.map((workflow) => (
              <Link 
                key={workflow.id} 
                to={`/workflows/${workflow.id}`}
                className="block bg-white p-4 rounded-xl shadow-sm border border-neutral-200 active:bg-neutral-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${workflow.active ? 'bg-green-500' : 'bg-neutral-300'}`} />
                    <h3 className="font-semibold text-neutral-900 line-clamp-1">{workflow.name}</h3>
                  </div>
                  <GitMerge size={16} className="text-neutral-400 shrink-0" />
                </div>
                
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>Updated {formatDistanceToNow(new Date(workflow.updatedAt), { addSuffix: true })}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Settings size={12} /> {workflow.nodes?.length || 0} nodes</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
