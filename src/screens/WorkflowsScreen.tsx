import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { GitMerge, Search, AlertCircle, Settings, Tag, Folder, ArrowDownUp } from 'lucide-react';
import { api } from '../api';
import { formatDistanceToNow } from 'date-fns';

type SortOption = 'name' | 'updatedAt' | 'createdAt';
type GroupOption = 'none' | 'tags' | 'status';

export default function WorkflowsScreen() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('updatedAt');
  const [groupBy, setGroupBy] = useState<GroupOption>('none');

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

  const processedWorkflows = useMemo(() => {
    let filtered = workflows.filter(w => 
      w.name.toLowerCase().includes(search.toLowerCase())
    );

    filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'createdAt') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    if (groupBy === 'none') {
      return { 'All Workflows': filtered };
    }

    const grouped: Record<string, any[]> = {};
    
    if (groupBy === 'status') {
      grouped['Active'] = filtered.filter(w => w.active);
      grouped['Disabled'] = filtered.filter(w => !w.active);
    } else if (groupBy === 'tags') {
      filtered.forEach(w => {
        if (!w.tags || w.tags.length === 0) {
          if (!grouped['Untagged']) grouped['Untagged'] = [];
          grouped['Untagged'].push(w);
        } else {
          w.tags.forEach((tag: any) => {
            const tagName = tag.name || tag;
            if (!grouped[tagName]) grouped[tagName] = [];
            grouped[tagName].push(w);
          });
        }
      });
    }

    return grouped;
  }, [workflows, search, sortBy, groupBy]);

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-4">Workflows</h2>
        <div className="space-y-3">
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
          
          <div className="flex gap-2">
            <div className="flex-1 bg-white border border-neutral-200 rounded-xl px-3 py-2 flex items-center gap-2">
              <ArrowDownUp size={16} className="text-neutral-400" />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-sm w-full focus:outline-none"
              >
                <option value="updatedAt">Updated</option>
                <option value="createdAt">Created</option>
                <option value="name">Name</option>
              </select>
            </div>
            <div className="flex-1 bg-white border border-neutral-200 rounded-xl px-3 py-2 flex items-center gap-2">
              <Folder size={16} className="text-neutral-400" />
              <select 
                value={groupBy} 
                onChange={(e) => setGroupBy(e.target.value as GroupOption)}
                className="bg-transparent text-sm w-full focus:outline-none"
              >
                <option value="none">No Grouping</option>
                <option value="tags">By Tags</option>
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
          {Object.entries(processedWorkflows).length === 0 || Object.values(processedWorkflows).every(arr => arr.length === 0) ? (
            <div className="text-center py-10 text-neutral-500">
              No workflows found.
            </div>
          ) : (
            Object.entries(processedWorkflows).map(([groupName, groupWorkflows]) => (
              groupWorkflows.length > 0 && (
                <div key={groupName} className="space-y-3">
                  {groupBy !== 'none' && (
                    <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider px-1">
                      {groupName} <span className="text-neutral-400 font-normal">({groupWorkflows.length})</span>
                    </h3>
                  )}
                  {groupWorkflows.map((workflow) => (
                    <Link 
                      key={workflow.id} 
                      to={`/executions?workflowId=${workflow.id}`}
                      className="block bg-white p-4 rounded-xl shadow-sm border border-neutral-200 active:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${workflow.active ? 'bg-green-500' : 'bg-neutral-300'}`} />
                          <h3 className="font-semibold text-neutral-900 line-clamp-1">{workflow.name}</h3>
                        </div>
                        <GitMerge size={16} className="text-neutral-400 shrink-0" />
                      </div>
                      
                      {workflow.tags && workflow.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {workflow.tags.map((tag: any, idx: number) => (
                            <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 text-neutral-600 text-[10px] rounded-md font-medium">
                              <Tag size={10} />
                              {tag.name || tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span>Updated {formatDistanceToNow(new Date(workflow.updatedAt), { addSuffix: true })}</span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1"><Settings size={12} /> {workflow.nodes?.length || 0} nodes</span>
                        </div>
                      </div>
                    </Link>
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
