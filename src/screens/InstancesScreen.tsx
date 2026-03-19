import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Server, ChevronRight, AlertCircle } from 'lucide-react';
import { useStore } from '../store';

export default function InstancesScreen() {
  const navigate = useNavigate();
  const { instances, addInstance, removeInstance, setActiveInstance } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', url: '', apiKey: '' });
  const [error, setError] = useState('');

  const handleConnect = (id: string) => {
    setActiveInstance(id);
    navigate('/');
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.url || !formData.apiKey) {
      setError('All fields are required');
      return;
    }

    try {
      new URL(formData.url);
    } catch {
      setError('Invalid URL format');
      return;
    }

    addInstance(formData);
    setFormData({ name: '', url: '', apiKey: '' });
    setIsAdding(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-4 flex flex-col">
      <div className="mb-8 mt-8 text-center">
        <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg shadow-orange-500/30">
          n8n
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">n8n Mobile</h1>
        <p className="text-neutral-500 mt-1">Connect to your self-hosted instances</p>
      </div>

      {isAdding ? (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-200">
          <h2 className="text-lg font-semibold mb-4">Add Instance</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Production Server"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">URL</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="https://n8n.yourdomain.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">API Key</label>
              <input
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="n8n_api_..."
              />
              <p className="text-xs text-neutral-500 mt-1">Create this in n8n Settings &gt; n8n API</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          {instances.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200 border-dashed">
              <Server className="mx-auto text-neutral-300 mb-3" size={48} />
              <h3 className="text-neutral-900 font-medium">No instances saved</h3>
              <p className="text-neutral-500 text-sm mt-1 mb-4">Add your first n8n instance to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {instances.map((instance) => (
                <div
                  key={instance.id}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-200 flex items-center justify-between group"
                >
                  <button
                    onClick={() => handleConnect(instance.id)}
                    className="flex-1 flex items-center gap-3 text-left"
                  >
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0">
                      <Server size={20} />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-semibold text-neutral-900 truncate">{instance.name}</h3>
                      <p className="text-xs text-neutral-500 truncate">{instance.url}</p>
                    </div>
                  </button>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => removeInstance(instance.id)}
                      className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                    <ChevronRight className="text-neutral-300" size={20} />
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <button
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors"
          >
            <Plus size={20} />
            Add Instance
          </button>

          <button
            onClick={() => {
              const existing = instances.find(i => i.url === 'https://mock.n8n.local');
              if (existing) {
                handleConnect(existing.id);
              } else {
                // We don't have the ID immediately from addInstance, so we can just add it
                // and the user can click it in the list.
                // Or we can just use a fixed ID for the mock instance.
                const mockId = 'mock-instance-id';
                useStore.setState((state) => ({
                  instances: [...state.instances, { 
                    id: mockId, 
                    name: 'Test Instance (Mock API)', 
                    url: 'https://mock.n8n.local', 
                    apiKey: 'mock-api-key' 
                  }]
                }));
                handleConnect(mockId);
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-orange-100 text-orange-700 rounded-xl font-medium hover:bg-orange-200 transition-colors"
          >
            <Server size={20} />
            Load Test Instance
          </button>
        </div>
      )}
    </div>
  );
}
