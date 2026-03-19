import { useEffect, useState } from 'react';
import { Key, AlertCircle, Edit2, X, Save } from 'lucide-react';
import { api } from '../api';
import { formatDistanceToNow } from 'date-fns';

export default function CredentialsScreen() {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingCred, setEditingCred] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editData, setEditData] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCredentials = async () => {
    try {
      const res = await api.getCredentials();
      setCredentials(res.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const handleEdit = (cred: any) => {
    setEditingCred(cred);
    setEditName(cred.name);
    setEditData('{\n  \n}'); // Empty JSON template for data
  };

  const handleSave = async () => {
    if (!editingCred) return;
    setSaving(true);
    try {
      let parsedData = {};
      if (editData.trim()) {
        try {
          parsedData = JSON.parse(editData);
        } catch (e) {
          alert('Invalid JSON in data field');
          setSaving(false);
          return;
        }
      }
      
      await api.updateCredential(editingCred.id, {
        name: editName,
        data: parsedData
      });
      
      setEditingCred(null);
      await fetchCredentials();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (editingCred) {
    return (
      <div className="p-4 flex flex-col h-full bg-neutral-50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Edit Credential</h2>
          <button 
            onClick={() => setEditingCred(null)}
            className="p-2 text-neutral-500 hover:bg-neutral-200 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Data (JSON)</label>
            <textarea
              value={editData}
              onChange={(e) => setEditData(e.target.value)}
              className="w-full h-32 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
              placeholder={'{\n  "apiKey": "your-key"\n}'}
            />
            <p className="text-xs text-neutral-500 mt-1">
              Warning: This will overwrite existing credential data. Leave empty to keep existing data.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Save size={20} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-xl font-bold">Credentials</h2>
      </div>

      {error && (
        <div className="p-4 mb-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700">
          <AlertCircle className="shrink-0 mt-0.5" size={20} />
          <p className="text-sm whitespace-pre-wrap">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3 pb-4">
          {credentials.length === 0 ? (
            <div className="text-center py-10 text-neutral-500">
              No credentials found.
            </div>
          ) : (
            credentials.map((cred) => (
              <div 
                key={cred.id} 
                className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200 flex items-center gap-4 group"
              >
                <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shrink-0">
                  <Key size={20} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-semibold text-neutral-900 truncate">{cred.name}</h3>
                  <p className="text-xs text-neutral-500 truncate">{cred.type}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-xs text-neutral-400">
                    {formatDistanceToNow(new Date(cred.updatedAt), { addSuffix: true })}
                  </div>
                  <button
                    onClick={() => handleEdit(cred)}
                    className="p-2 text-neutral-400 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
